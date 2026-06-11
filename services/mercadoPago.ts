import { CheckoutAddress } from '../types';

export interface CheckoutData {
  userId: string;
  userEmail: string;
  userName: string;
  userCPF: string;
  address: CheckoutAddress;
  planType: 'monthly' | 'annual';
}

export interface CheckoutResponse {
  checkoutUrl: string;
  preferenceId: string;
  sandboxInitPoint?: string;
}

// O access token do Mercado Pago vive apenas no endpoint serverless
// /api/mercadopago — o browser nunca vê a credencial.

/**
 * Cria uma preferência de checkout no Mercado Pago.
 */
export const createPremiumCheckout = async (data: CheckoutData): Promise<CheckoutResponse> => {
  try {
    const response = await fetch('/api/mercadopago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-preference',
        data,
        origin: window.location.origin
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro ao criar preferência');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Mercado Pago Error:', error);
    throw error;
  }
};

export const checkPaymentStatus = async (paymentId: string) => {
  const response = await fetch('/api/mercadopago', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'payment-status', paymentId })
  });
  return await response.json();
};
