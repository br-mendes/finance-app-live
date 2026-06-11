// Endpoint serverless (Vercel) para o Mercado Pago. O access token fica
// apenas no servidor; o browser chama este endpoint.

const MP_ACCESS_TOKEN =
  process.env.MERCADO_PAGO_ACCESS_TOKEN ||
  process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN ||
  'APP_USR-3087166554-TEST';

const createPreference = async (body: any) => {
  const { data, origin } = body;
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
        success: `${origin}/#/payment-success`,
        failure: `${origin}/#/plans`,
        pending: `${origin}/#/`
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
    checkoutUrl: result.init_point,
    preferenceId: result.id,
    sandboxInitPoint: result.sandbox_init_point
  };
};

const paymentStatus = async (paymentId: string) => {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
  });
  return await response.json();
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action } = req.body || {};

    switch (action) {
      case 'create-preference':
        return res.status(200).json(await createPreference(req.body));
      case 'payment-status': {
        if (!req.body.paymentId) return res.status(400).json({ error: 'paymentId obrigatório' });
        return res.status(200).json(await paymentStatus(req.body.paymentId));
      }
      default:
        return res.status(400).json({ error: 'Ação inválida' });
    }
  } catch (error: any) {
    console.error('[API Mercado Pago Error]', error.message);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
