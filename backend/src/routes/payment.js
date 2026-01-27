const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

dotenv.config();

mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

// Utilitário para criar plano no Mercado Pago
async function createMPPlan({ planType, price, frequency, frequencyType }) {
  const body = {
    reason: `Plano ${planType === 'monthly' ? 'Mensal' : 'Anual'} SaaS`,
    auto_recurring: {
      frequency,
      frequency_type: frequencyType,
      transaction_amount: price,
      currency_id: 'BRL',
    },
    payment_methods_allowed: { payment_types: [{ id: 'credit_card' }] },
  };
  const result = await mercadopago.preApprovalPlan.create(body);
  return result.body.id;
}

// POST /plans: Cria planos mensal e anual
router.post('/plans', async (req, res) => {
  try {
    // Cria plano mensal
    let monthlyPlan = await Plan.findOne({ planType: 'monthly' });
    if (!monthlyPlan) {
      const mpPlanId = await createMPPlan({ planType: 'monthly', price: 100, frequency: 1, frequencyType: 'months' });
      monthlyPlan = await Plan.create({ planType: 'monthly', mpPlanId, price: 100, frequency: 1, frequencyType: 'months' });
    }
    // Cria plano anual
    let annualPlan = await Plan.findOne({ planType: 'annual' });
    if (!annualPlan) {
      const mpPlanId = await createMPPlan({ planType: 'annual', price: 1100, frequency: 1, frequencyType: 'years' });
      annualPlan = await Plan.create({ planType: 'annual', mpPlanId, price: 1100, frequency: 1, frequencyType: 'years' });
    }
    res.status(201).json({ monthlyPlan, annualPlan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /subscriptions: Cria assinatura para usuário
router.post('/subscriptions', async (req, res) => {
  try {
    const { email, token, planType } = req.body;
    if (!email || !token || !planType) return res.status(400).json({ error: 'email, token e planType são obrigatórios' });
    const plan = await Plan.findOne({ planType });
    if (!plan) return res.status(404).json({ error: 'Plano não encontrado' });
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ email });
    // Cria assinatura no Mercado Pago
    const body = {
      preapproval_plan_id: plan.mpPlanId,
      payer_email: email,
      card_token_id: token,
      back_url: 'https://seusite.com/sucesso',
      status: 'authorized',
    };
    const result = await mercadopago.preApproval.create(body);
    // Salva assinatura no banco
    const subscription = await Subscription.create({
      userId: user._id,
      mpSubscriptionId: result.body.id,
      status: result.body.status,
      planType,
      nextBilling: result.body.auto_recurring.next_payment_date,
    });
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /subscriptions/:id: Consulta status da assinatura
router.get('/subscriptions/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate('userId');
    if (!subscription) return res.status(404).json({ error: 'Assinatura não encontrada' });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /webhooks: Recebe notificações do Mercado Pago
router.post('/webhooks', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type !== 'preapproval') return res.status(200).send('ignorado');
    const mpSubscriptionId = data && data.id;
    if (!mpSubscriptionId) return res.status(400).send('id ausente');
    const subscription = await Subscription.findOne({ mpSubscriptionId });
    if (!subscription) return res.status(404).send('assinatura não encontrada');
    // Busca status atualizado no Mercado Pago
    const mpResult = await mercadopago.preApproval.findById(mpSubscriptionId);
    const newStatus = mpResult.body.status;
    // Idempotência: só atualiza se mudou
    if (subscription.status !== newStatus) {
      subscription.status = newStatus;
      subscription.nextBilling = mpResult.body.auto_recurring.next_payment_date;
      // Grace period: 3 dias se pending/failure
      if (['pending', 'failure'].includes(newStatus)) {
        const grace = new Date();
        grace.setDate(grace.getDate() + 3);
        subscription.gracePeriodUntil = grace;
      } else {
        subscription.gracePeriodUntil = null;
      }
      subscription.updatedAt = new Date();
      await subscription.save();
    }
    res.status(200).send('ok');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
