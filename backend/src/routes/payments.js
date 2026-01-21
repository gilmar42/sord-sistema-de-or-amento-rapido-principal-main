const express = require('express');
const crypto = require('crypto');
const mercadopago = require('mercadopago');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const router = express.Router();

// Expect env names using pattern MERCADO_PAGO_* to match our .env files
console.log('DEBUG MP_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN);
console.log('DEBUG MP_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN);
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
const MP_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || process.env.MERCADOPAGO_PUBLIC_KEY;
const MP_WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const PLAN_PRICING = {
  monthly: 100,
  annual: 1100,
};

if (MP_ACCESS_TOKEN) {
  mercadopago.configure({
    access_token: MP_ACCESS_TOKEN,
  });
}

const getPaymentByIdempotencyKey = (key) => {
  if (!key) return null;
  return db.prepare('SELECT * FROM payments WHERE idempotency_key = ?').get(key);
};

const parseInitPoints = (paymentRow) => {
  if (!paymentRow?.raw_payload) return {};
  try {
    const parsed = JSON.parse(paymentRow.raw_payload);
    return {
      initPoint: parsed.initPoint,
      sandboxInitPoint: parsed.sandboxInitPoint,
    };
  } catch (error) {
    return {};
  }
};

const upsertPaymentStatus = ({
  planType,
  status,
  amount,
  currency,
  preferenceId,
  paymentId,
  payerEmail,
  rawPayload,
}) => {
  const update = db.prepare(`
    UPDATE payments
    SET status = ?,
        mp_payment_id = COALESCE(mp_payment_id, ?),
        payer_email = COALESCE(?, payer_email),
        amount = ?,
        currency = ?,
        raw_payload = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE mp_preference_id = ?
  `);

  const result = update.run(status, paymentId, payerEmail, amount, currency, rawPayload, preferenceId);

  if (result.changes === 0) {
    const insert = db.prepare(`
      INSERT INTO payments (
        id, plan_type, status, amount, currency, mp_preference_id, mp_payment_id, payer_email, raw_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(uuidv4(), planType, status, amount, currency, preferenceId, paymentId, payerEmail, rawPayload);
  }
};

router.post('/preference', async (req, res) => {
  try {
    if (!MP_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Mercado Pago access token is not configured on the server.' });
    }

    const { planType = 'monthly', customerEmail } = req.body;
    const idempotencyKey = req.get('Idempotency-Key');

    if (!PLAN_PRICING[planType]) {
      return res.status(400).json({ error: 'Plano inválido. Use "monthly" ou "annual".' });
    }

    const existing = getPaymentByIdempotencyKey(idempotencyKey);
    if (existing && existing.mp_preference_id) {
      const parsed = parseInitPoints(existing);
      return res.json({
        preferenceId: existing.mp_preference_id,
        initPoint: parsed.initPoint,
        sandboxInitPoint: parsed.sandboxInitPoint,
        publicKey: MP_PUBLIC_KEY || null,
      });
    }

    const amount = PLAN_PRICING[planType];
    const preference = {
      items: [
        {
          title: planType === 'monthly' ? 'SORED - Plano Mensal' : 'SORED - Plano Anual',
          description: 'Acesso ao sistema SORED',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: amount,
        },
      ],
      back_urls: {
        success: `${FRONTEND_URL}/?payment=success`,
        failure: `${FRONTEND_URL}/?payment=failure`,
        pending: `${FRONTEND_URL}/?payment=pending`,
      },
      auto_return: 'approved',
      notification_url: `${BASE_URL}/api/payments/webhook`,
      metadata: {
        planType,
        idempotencyKey,
        source: 'sored-app',
      },
      payer: customerEmail ? { email: customerEmail } : undefined,
    };

    const response = await mercadopago.preferences.create(preference);
    const { id: preferenceId, init_point: initPoint, sandbox_init_point: sandboxInitPoint } = response.body || {};

    if (!preferenceId) {
      return res.status(500).json({ error: 'Não foi possível criar a preferência de pagamento.' });
    }

    const insert = db.prepare(`
      INSERT INTO payments (
        id, plan_type, status, amount, currency, mp_preference_id, idempotency_key, raw_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      uuidv4(),
      planType,
      'pending',
      amount,
      'BRL',
      preferenceId,
      idempotencyKey || null,
      JSON.stringify({ preferenceId, initPoint, sandboxInitPoint })
    );

    res.json({ preferenceId, initPoint, sandboxInitPoint, publicKey: MP_PUBLIC_KEY || null });
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    res.status(500).json({ error: 'Erro ao criar preferência de pagamento.' });
  }
});

router.get('/status/:preferenceId', (req, res) => {
  const { preferenceId } = req.params;
  const payment = db.prepare('SELECT * FROM payments WHERE mp_preference_id = ?').get(preferenceId);

  if (!payment) {
    return res.status(404).json({ error: 'Pagamento não encontrado.' });
  }

  res.json({
    status: payment.status,
    planType: payment.plan_type,
    amount: payment.amount,
    currency: payment.currency,
    preferenceId: payment.mp_preference_id,
    paymentId: payment.mp_payment_id,
    payerEmail: payment.payer_email,
  });
});

router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    if (!MP_WEBHOOK_SECRET) {
      return res.status(500).json({ error: 'Webhook secret not configured.' });
    }

    const signature = req.get('x-signature');
    const topic = req.get('x-event-type');
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(req.body || '');

    if (!signature) {
      return res.status(400).json({ error: 'Assinatura ausente.' });
    }

    const signatureParts = Object.fromEntries(
      signature
        .split(',')
        .map((part) => part.trim().split('='))
        .filter((pair) => pair.length === 2)
    );
    const ts = signatureParts.ts;
    const v1 = signatureParts.v1;

    if (!ts || !v1) {
      return res.status(400).json({ error: 'Assinatura inválida.' });
    }

    const computed = crypto
      .createHmac('sha256', MP_WEBHOOK_SECRET)
      .update(`${ts}${req.originalUrl}${rawBody}`)
      .digest('hex');

    const computedBuffer = Buffer.from(computed);
    const v1Buffer = Buffer.from(v1);

    if (computedBuffer.length !== v1Buffer.length || !crypto.timingSafeEqual(computedBuffer, v1Buffer)) {
      return res.status(401).json({ error: 'Assinatura inválida.' });
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    const paymentId = payload?.data?.id;
    const eventType = payload?.type || payload?.action || topic;

    if (!paymentId || eventType !== 'payment') {
      return res.status(200).json({ received: true, ignored: true });
    }

    const paymentInfo = await mercadopago.payment.findById(paymentId);
    const payment = paymentInfo.body || {};
    const preferenceId = payment?.order?.id || payment?.metadata?.preference_id;
    const planType = payment?.metadata?.planType || 'monthly';
    const status = payment?.status || 'unknown';
    const payerEmail = payment?.payer?.email || null;
    const amount = payment?.transaction_amount || PLAN_PRICING[planType] || 0;
    const currency = payment?.currency_id || 'BRL';

    if (!preferenceId) {
      return res.status(200).json({ received: true, missingPreference: true });
    }

    upsertPaymentStatus({
      planType,
      status,
      amount,
      currency,
      preferenceId,
      paymentId: paymentId.toString(),
      payerEmail,
      rawPayload: JSON.stringify(payload),
    });

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Mercado Pago webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook.' });
  }
});

module.exports = router;
