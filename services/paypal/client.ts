import { PAYPAL_CLIENT_ID, PAYPAL_SECRET_KEY, PAYPAL_ENVIRONMENT, PAYPAL_SANDBOX_URL } from '../../constants';

// Interfaces
export interface PayPalOrder {
  id: string;
  status: string;
  create_time: string;
  update_time: string;
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description: string;
    custom_id: string;
  }>;
  payer: {
    email_address: string;
    payer_id: string;
    name: {
      given_name: string;
      surname: string;
    };
    address: {
      country_code: string;
    };
  };
}

export interface CreateOrderData {
  userId: string;
  userEmail: string;
  userName: string;
  planType: 'monthly' | 'annual';
  returnUrl?: string;
  cancelUrl?: string;
}

const getApiUrl = () => {
  return PAYPAL_ENVIRONMENT === 'sandbox' ? PAYPAL_SANDBOX_URL : 'https://api-m.paypal.com';
};

// Obter access token via Fetch (Base64 nativo btoa)
let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

const getAccessToken = async (): Promise<string> => {
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`);

  try {
    const response = await fetch(`${getApiUrl()}/v1/oauth2/token`, {
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
  } catch (error: any) {
    console.error('PayPal Auth Error:', error.message);
    throw error;
  }
};

// Criar ordem de pagamento
export const createPayPalOrder = async (data: CreateOrderData): Promise<{
  orderId: string;
  approvalUrl: string;
}> => {
  try {
    const token = await getAccessToken();
    const price = data.planType === 'monthly' ? '19.90' : '179.00';
    const description = data.planType === 'monthly' 
      ? 'FinanceApp Premium - Plano Mensal' 
      : 'FinanceApp Premium - Plano Anual';

    const currentOrigin = window.location.origin;

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'BRL',
          value: price
        },
        description: description,
        custom_id: `premium_${data.userId}_${data.planType}_${Date.now()}`
      }],
      application_context: {
        brand_name: 'FinanceApp',
        locale: 'pt-BR',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: data.returnUrl || `${currentOrigin}/#/payment/paypal-success`,
        cancel_url: data.cancelUrl || `${currentOrigin}/#/payment/paypal-cancel`
      }
    };

    const response = await fetch(`${getApiUrl()}/v2/checkout/orders`, {
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

    return {
      orderId: result.id,
      approvalUrl: approvalLink.href
    };
  } catch (error: any) {
    console.error('PayPal Create Order Error:', error.message);
    throw error;
  }
};

// Capturar pagamento
export const capturePayPalOrder = async (orderId: string) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${getApiUrl()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    const result = await response.json();
    // Se já foi capturado, retorna o resultado como sucesso (idempotência básica client-side)
    if (!response.ok && result.name !== 'RESOURCE_ALREADY_CAPTURED') {
        throw new Error(result.message || 'Erro ao capturar pagamento');
    }
    return result;
  } catch (error: any) {
    console.error('PayPal Capture Error:', error.message);
    throw error;
  }
};

// Verificar status da ordem
export const getOrderDetails = async (orderId: string) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${getApiUrl()}/v2/checkout/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch (error: any) {
    console.error('PayPal Get Order Error:', error);
    throw error;
  }
};