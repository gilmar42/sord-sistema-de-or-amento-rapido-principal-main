const express = require('express');
const crypto = require('crypto');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const router = express.Router();

// Busca pagamento por idempotency_key
function getPaymentByIdempotencyKey(idempotencyKey) {
  if (!idempotencyKey) return null;
  try {
    return db.prepare('SELECT * FROM payments WHERE idempotency_key = ?').get(idempotencyKey);
  } catch (err) {
    console.error('[getPaymentByIdempotencyKey] DB error:', err);
    return null;
  }
}

// Extrai initPoint e sandboxInitPoint do campo raw_payload do registro do banco
function parseInitPoints(paymentRow) {
  if (!paymentRow || !paymentRow.raw_payload) return { initPoint: null, sandboxInitPoint: null };
  try {
    const payload = typeof paymentRow.raw_payload === 'string' ? JSON.parse(paymentRow.raw_payload) : paymentRow.raw_payload;
    return {
      initPoint: payload.initPoint || null,
      sandboxInitPoint: payload.sandboxInitPoint || null
    };
  } catch (err) {
    console.error('[parseInitPoints] JSON parse error:', err);
    return { initPoint: null, sandboxInitPoint: null };
  }
}

// Atualiza ou insere status do pagamento no banco
function upsertPaymentStatus({ planType, status, amount, currency, preferenceId, paymentId, payerEmail, rawPayload }) {
  if (!preferenceId) return;
  try {
    const existing = db.prepare('SELECT * FROM payments WHERE mp_preference_id = ?').get(preferenceId);
    if (existing) {
      db.prepare(`UPDATE payments SET status = ?, mp_payment_id = ?, payer_email = ?, raw_payload = ?, updated_at = CURRENT_TIMESTAMP WHERE mp_preference_id = ?`).run(
        status,
        paymentId || existing.mp_payment_id,
        payerEmail || existing.payer_email,
        rawPayload || existing.raw_payload,
        preferenceId
      );
    } else {
      db.prepare(`INSERT INTO payments (id, plan_type, status, amount, currency, mp_preference_id, mp_payment_id, payer_email, raw_payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`).run(
        uuidv4(),
        planType || 'monthly',
        status || 'unknown',
        amount || 0,
        currency || 'BRL',
        preferenceId,
        paymentId || null,
        payerEmail || null,
        rawPayload || null
      );
    }
  } catch (err) {
    console.error('[upsertPaymentStatus] DB error:', err);
  }
}
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
const MP_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || process.env.MERCADOPAGO_PUBLIC_KEY;
const MP_WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const PLAN_PRICING = { monthly: 100, annual: 1100 };
const client = MP_ACCESS_TOKEN ? new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN }) : null;
const preferenceApi = client ? new Preference(client) : null;
const paymentApi = client ? new Payment(client) : null;

router.post('/preference', async (req, res) => {
      // ...existing code...
      // Removido bloco duplicado. Definição única ocorre abaixo após validação do plano.
  console.log('DEBUG MP_ACCESS_TOKEN (runtime):', MP_ACCESS_TOKEN);
  if (!preferenceApi) {
    console.error('preferenceApi está null! Verifique se o access token Mercado Pago está correto e disponível nas variáveis de ambiente.');
    return res.status(500).json({ error: 'preferenceApi não inicializado. Verifique o access token Mercado Pago.' });
  }
  if (!MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Mercado Pago access token is not configured on the server.' });
  }

  try {
    const { planType = 'monthly', customerEmail } = req.body;
    let idempotencyKey = req.get('Idempotency-Key');
    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      idempotencyKey = uuidv4();
      console.warn('Idempotency-Key ausente ou inválido, gerando novo:', idempotencyKey);
    }

    if (!PLAN_PRICING[planType]) {
      return res.status(400).json({ error: 'Plano inválido. Use "monthly" ou "annual".' });
    }

    const existing = getPaymentByIdempotencyKey(idempotencyKey);
    if (existing && existing.mp_preference_id) {
      const parsed = parseInitPoints(existing);
      return res.status(200).json({
        preferenceId: existing.mp_preference_id,
        initPoint: parsed.initPoint,
        sandboxInitPoint: parsed.sandboxInitPoint,
        publicKey: MP_PUBLIC_KEY || null,
      });
    }

    const amount = Number(PLAN_PRICING[planType]);
    // Payload mínimo e seguro para Mercado Pago
    const preference = {
      items: [
        {
          title: planType === 'monthly' ? 'SORED - Plano Mensal' : 'SORED - Plano Anual',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: amount,
        }
      ],
      auto_return: 'approved',
      notification_url: `${BASE_URL}/api/payments/webhook`,
      back_urls: {
        success: `${FRONTEND_URL}/?payment=success`,
        failure: `${FRONTEND_URL}/?payment=failure`,
        pending: `${FRONTEND_URL}/?payment=pending`,
      },
      metadata: {
        planType: String(planType),
        idempotencyKey: String(idempotencyKey),
        source: 'sored-app',
      }
    };
    if (customerEmail && typeof customerEmail === 'string') {
      preference.payer = { email: customerEmail };
    }

    // Remove campos undefined ou nulos do objeto preference (defensivo, recursivo)
    function cleanObject(obj) {
      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      } else if (obj && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null) {
            acc[k] = cleanObject(v);
          }
          return acc;
        }, {});
      }
      return obj;
    }
    const cleanedPreference = cleanObject(preference);

    console.log('Preference payload (cleaned):', JSON.stringify(cleanedPreference, null, 2));
    console.log('Preference payload typeof:', typeof cleanedPreference);
    console.log('Preference.items typeof:', typeof cleanedPreference.items, Array.isArray(cleanedPreference.items));
    console.log('Preference.metadata typeof:', typeof cleanedPreference.metadata);
    try {
      const sdkVersion = require('mercadopago/package.json').version;
      console.log('MercadoPago SDK version:', sdkVersion);
    } catch (e) {
      console.log('Não foi possível obter a versão do SDK MercadoPago');
    }
    // Remover notification_url se for localhost (Mercado Pago não aceita URL local)
    if (cleanedPreference.notification_url && cleanedPreference.notification_url.includes('localhost')) {
      console.warn('Removendo notification_url do payload pois está em localhost:', cleanedPreference.notification_url);
      delete cleanedPreference.notification_url;
    }
    // Remover back_urls se qualquer URL for localhost
    if (cleanedPreference.back_urls) {
      const urls = Object.values(cleanedPreference.back_urls || {});
      if (urls.some(url => typeof url === 'string' && url.includes('localhost'))) {
        console.warn('Removendo back_urls do payload pois contém localhost:', cleanedPreference.back_urls);
        delete cleanedPreference.back_urls;
      }
    }
    // Remover metadata do payload Mercado Pago (pode causar erro de formato)
    if (cleanedPreference.metadata) {
      console.warn('Removendo metadata do payload Mercado Pago:', cleanedPreference.metadata);
      delete cleanedPreference.metadata;
    }
    // Log do payload final
    console.log('Payload FINAL enviado ao Mercado Pago:', JSON.stringify(cleanedPreference, null, 2));
    // Tentar enviar o payload como JSON puro se possível
    let response;
    try {
      // Testar se o SDK aceita string JSON
      let sentPayload = cleanedPreference;
      if (process.env.FORCE_MP_PAYLOAD_STRING === '1') {
        sentPayload = JSON.stringify(cleanedPreference);
        console.log('Enviando payload como string JSON');
      }
      response = await preferenceApi.create(sentPayload);
      console.log('PreferenceApi.create chamada padrão');
    } catch (err) {
      // Log detalhado do erro Mercado Pago
      console.error('Mercado Pago error:', err && err.response && err.response.data ? JSON.stringify(err.response.data, null, 2) : err);
      if (err && err.response) {
        console.error('Mercado Pago error response headers:', err.response.headers);
        console.error('Mercado Pago error response status:', err.response.status);
      }
      // Logar o payload real enviado
      try {
        console.error('Payload enviado ao Mercado Pago:', JSON.stringify(cleanedPreference, null, 2));
      } catch (e) {}
      return res.status(500).json({ error: 'Erro Mercado Pago', details: err && err.response && err.response.data ? err.response.data : err });
    }
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
    // Log detalhado do erro
    console.error('Error creating Mercado Pago preference:', error);
    if (error.response) {
      console.error('Mercado Pago error response:', JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).json({ error: 'Erro ao criar preferência de pagamento.', details: error.message, mp_error: error.response?.data });
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

    const paymentInfo = await paymentApi.findById(paymentId);
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
