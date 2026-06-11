// Endpoint serverless (Vercel) para operações PayPal que exigem o secret.
// O secret nunca chega ao client: o browser chama este endpoint e o servidor
// fala com a API do PayPal.

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY || process.env.VITE_PAYPAL_SECRET_KEY || '';
const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || process.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox';

const API_URL = PAYPAL_ENVIRONMENT === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

/** Obtém (ou reutiliza do cache) o access token OAuth 2.0 do PayPal. */
const getAccessToken = async (): Promise<string> => {
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`);
  const response = await fetch(`${API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) throw new Error('Falha na autenticação com PayPal');

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = new Date(Date.now() + (data.expires_in * 1000) - 60000);
  return accessToken!;
};

/** Cria uma ordem de pagamento no PayPal e retorna o `orderId` e a URL de aprovação. */
const createOrder = async (body: any) => {
  const { planType, userId, returnUrl, cancelUrl } = body;
  const token = await getAccessToken();
  const price = planType === 'monthly' ? '19.90' : '179.00';
  const description = planType === 'monthly'
    ? 'FinanceApp Premium - Plano Mensal'
    : 'FinanceApp Premium - Plano Anual';

  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'BRL',
        value: price
      },
      description,
      custom_id: `premium_${userId}_${planType}_${Date.now()}`
    }],
    application_context: {
      brand_name: 'FinanceApp',
      locale: 'pt-BR',
      landing_page: 'BILLING',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: returnUrl,
      cancel_url: cancelUrl
    }
  };

  const response = await fetch(`${API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(orderData)
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Erro ao criar ordem no PayPal');

  const approvalLink = result.links.find((link: any) => link.rel === 'approve');
  if (!approvalLink) throw new Error('Link de aprovação não encontrado');

  return { orderId: result.id, approvalUrl: approvalLink.href };
};

/** Captura o pagamento de uma ordem aprovada. Idempotente: ignora RESOURCE_ALREADY_CAPTURED. */
const captureOrder = async (orderId: string) => {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  });

  const result = await response.json();
  // Se já foi capturado, retorna como sucesso (idempotência básica)
  if (!response.ok && result.name !== 'RESOURCE_ALREADY_CAPTURED') {
    throw new Error(result.message || 'Erro ao capturar pagamento');
  }
  return result;
};

/** Retorna os detalhes de uma ordem PayPal pelo `orderId`. Lança erro em respostas não-2xx. */
const getOrderDetails = async (orderId: string) => {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/v2/checkout/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `Erro ao consultar ordem ${orderId} no PayPal (${response.status})`);
  return result;
};

/** Endpoint Vercel: roteia ações PayPal (create-order, capture-order, order-details). */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
    return res.status(503).json({ error: 'PayPal não configurado no servidor' });
  }

  try {
    const { action } = req.body || {};

    switch (action) {
      case 'create-order':
        return res.status(200).json(await createOrder(req.body));
      case 'capture-order': {
        if (!req.body.orderId) return res.status(400).json({ error: 'orderId obrigatório' });
        return res.status(200).json(await captureOrder(req.body.orderId));
      }
      case 'order-details': {
        if (!req.body.orderId) return res.status(400).json({ error: 'orderId obrigatório' });
        return res.status(200).json(await getOrderDetails(req.body.orderId));
      }
      default:
        return res.status(400).json({ error: 'Ação inválida' });
    }
  } catch (error: any) {
    console.error('[API PayPal Error]', error.message);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
