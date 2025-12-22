// Nota: Em um ambiente frontend real, a criação de preferências deve ocorrer no backend.
// Esta implementação segue o modelo solicitado para fins de demonstração/prototipagem rápida.

export interface CheckoutData {
  userId: string;
  userEmail: string;
  userName: string;
  userCPF: string;
  planType: 'monthly' | 'annual';
}

export interface CheckoutResponse {
  checkoutUrl: string;
  preferenceId: string;
  sandboxInitPoint?: string;
}

const MP_ACCESS_TOKEN = process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || '';

export const createPremiumCheckout = async (data: CheckoutData): Promise<CheckoutResponse> => {
  try {
    const price = data.planType === 'monthly' ? 19.90 : 179.00;
    const description = data.planType === 'monthly' 
      ? 'FinanceApp Premium - Plano Mensal' 
      : 'FinanceApp Premium - Plano Anual (10% de desconto)';

    // Chamada direta à API do Mercado Pago (Preferências)
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
            description: 'Acesso completo ao FinanceApp Premium',
            category_id: 'subscriptions',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: price
          }
        ],
        payer: {
          email: data.userEmail,
          name: data.userName,
          identification: {
            type: 'CPF',
            number: data.userCPF.replace(/\D/g, '')
          }
        },
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }],
          installments: 1
        },
        back_urls: {
          success: `${window.location.origin}/#/payment-success`,
          failure: `${window.location.origin}/#/`,
          pending: `${window.location.origin}/#/`
        },
        auto_return: 'approved',
        external_reference: `premium_${data.userId}_${Date.now()}`,
        binary_mode: true
      })
    });

    if (!response.ok) {
        throw new Error('Falha ao criar preferência no Mercado Pago');
    }

    const result = await response.json();

    return {
      checkoutUrl: result.init_point,
      preferenceId: result.id,
      sandboxInitPoint: result.sandbox_init_point
    };
  } catch (error: any) {
    console.error('Mercado Pago Error:', error);
    throw new Error(`Falha ao criar checkout: ${error.message}`);
  }
};

export const checkPaymentStatus = async (paymentId: string) => {
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error checking payment:', error);
    throw error;
  }
};

export const initMercadoPagoSDK = () => {
  return new Promise((resolve) => {
    if ((window as any).MercadoPago) {
        resolve(new (window as any).MercadoPago(process.env.VITE_MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' }));
        return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    document.body.appendChild(script);
    script.onload = () => {
      const mp = new (window as any).MercadoPago(process.env.VITE_MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' });
      resolve(mp);
    };
  });
};