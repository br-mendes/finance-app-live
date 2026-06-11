// Cliente PayPal: as operações que exigem o secret rodam no endpoint
// serverless /api/paypal — nenhuma credencial vive no browser.

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

/** Faz POST para `/api/paypal` e lança erro em respostas não-2xx. */
const callApi = async (payload: Record<string, any>) => {
  const response = await fetch('/api/paypal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro na comunicação com PayPal');
  return result;
};

/** Cria uma ordem de pagamento no PayPal via serverless e retorna orderId e URL de aprovação. */
export const createPayPalOrder = async (data: CreateOrderData): Promise<{
  orderId: string;
  approvalUrl: string;
}> => {
  try {
    const currentOrigin = window.location.origin;
    return await callApi({
      action: 'create-order',
      userId: data.userId,
      planType: data.planType,
      returnUrl: data.returnUrl || `${currentOrigin}/#/payment/paypal-success`,
      cancelUrl: data.cancelUrl || `${currentOrigin}/#/payment/paypal-cancel`
    });
  } catch (error: any) {
    console.error('PayPal Create Order Error:', error.message);
    throw error;
  }
};

/** Captura o pagamento de uma ordem PayPal aprovada pelo usuário. */
export const capturePayPalOrder = async (orderId: string) => {
  try {
    return await callApi({ action: 'capture-order', orderId });
  } catch (error: any) {
    console.error('PayPal Capture Error:', error.message);
    throw error;
  }
};

/** Consulta os detalhes de uma ordem PayPal pelo `orderId`. */
export const getOrderDetails = async (orderId: string) => {
  try {
    return await callApi({ action: 'order-details', orderId });
  } catch (error: any) {
    console.error('PayPal Get Order Error:', error);
    throw error;
  }
};
