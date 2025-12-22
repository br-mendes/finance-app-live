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

// Token obtido das credenciais de teste fornecidas (Vendedor)
const MP_ACCESS_TOKEN = process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-3087166554-TEST';

/**
 * Cria uma preferência de checkout no Mercado Pago.
 */
export const createPremiumCheckout = async (data: CheckoutData): Promise<CheckoutResponse> => {
  try {
    const price = data.planType === 'monthly' ? 19.90 : 179.00;
    const description = `FinanceApp Premium - ${data.planType === 'monthly' ? 'Plano Mensal' : 'Plano Anual'}`;

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            id: `premium_${data.planType}`,
            title: description,
            description: 'Acesso completo à inteligência financeira FinanceApp.',
            category_id: 'subscriptions',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: price
          }
        ],
        payer: {
          email: data.userEmail,
          name: data.userName.split(' ')[0],
          surname: data.userName.split(' ').slice(1).join(' '),
          identification: {
            type: 'CPF',
            number: data.userCPF.replace(/\D/g, '')
          },
          address: {
            zip_code: data.address.zipCode.replace(/\D/g, ''),
            street_name: data.address.street,
            street_number: parseInt(data.address.number) || 0
          }
        },
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }],
          installments: 1
        },
        back_urls: {
          success: `${window.location.origin}/#/payment-success`,
          failure: `${window.location.origin}/#/plans`,
          pending: `${window.location.origin}/#/`
        },
        auto_return: 'approved',
        external_reference: `user_${data.userId}`,
        binary_mode: true
      })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Erro ao criar preferência');
    }

    const result = await response.json();

    return {
      checkoutUrl: result.init_point, // Usar sandbox_init_point se em teste estrito
      preferenceId: result.id,
      sandboxInitPoint: result.sandbox_init_point
    };
  } catch (error: any) {
    console.error('Mercado Pago Error:', error);
    throw error;
  }
};

export const checkPaymentStatus = async (paymentId: string) => {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
  });
  return await response.json();
};