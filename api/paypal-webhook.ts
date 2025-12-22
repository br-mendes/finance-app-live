import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '../constants';

// Chave de serviço necessária para operações administrativas via Webhook
const supabase = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const PAYPAL_API_URL = process.env.VITE_PAYPAL_ENVIRONMENT === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com' 
  : 'https://api-m.paypal.com';

/**
 * Valida a assinatura do Webhook diretamente com a API do PayPal
 */
async function verifyPayPalSignature(headers: any, body: any) {
  const auth = btoa(`${process.env.VITE_PAYPAL_CLIENT_ID}:${process.env.VITE_PAYPAL_SECRET_KEY}`);
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transmission_id: headers['paypal-transmission-id'],
      transmission_time: headers['paypal-transmission-time'],
      transmission_sig: headers['paypal-transmission-sig'],
      cert_url: headers['paypal-cert-url'],
      auth_algo: headers['paypal-auth-algo'],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: body
    })
  });

  const verification = await response.json();
  return verification.verification_status === 'SUCCESS';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1. Validar origem da requisição
    const isValid = await verifyPayPalSignature(req.headers, req.body);
    if (!isValid) {
      console.error('[PayPal Webhook] Invalid Signature Detected');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const resource = event.resource;

    console.log(`[PayPal Webhook] Event: ${event.event_type} | Resource ID: ${resource.id}`);

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(resource);
        break;
      
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.DENIED':
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handlePaymentReversed(resource);
        break;

      default:
        console.log(`[PayPal Webhook] Unhandled event: ${event.event_type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[PayPal Webhook Error]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePaymentCompleted(resource: any) {
  // O custom_id é a chave para o UserId e PlanType
  const customId = resource.custom_id;
  if (!customId) return;

  const [prefix, userId, planType] = customId.split('_');
  if (prefix !== 'premium' || !userId) return;

  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + (planType === 'annual' ? 12 : 1));

  // 1. Atualizar Usuário
  await supabase.from('users').update({
    plan: 'premium',
    plan_renewal_date: renewalDate.toISOString()
  }).eq('id', userId);

  // 2. Log de Pagamento
  await supabase.from('payments').insert({
    user_id: userId,
    paypal_order_id: resource.id,
    amount: parseFloat(resource.amount.value),
    status: 'approved',
    plan: 'premium',
    payment_method: 'paypal',
    payment_details: resource
  });

  console.log(`[Webhook Success] User ${userId} upgraded via Webhook.`);
}

async function handlePaymentReversed(resource: any) {
  // Localizar o UserId via ID do pagamento original ou custom_id se disponível
  const { data: payment } = await supabase
    .from('payments')
    .select('user_id')
    .eq('paypal_order_id', resource.parent_payment || resource.id)
    .single();

  if (payment) {
    await supabase.from('users').update({
      plan: 'free',
      plan_renewal_date: null
    }).eq('id', payment.user_id);
    
    console.log(`[Webhook Reversion] User ${payment.user_id} downgraded due to refund/cancellation.`);
  }
}