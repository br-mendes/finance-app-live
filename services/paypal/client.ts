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

// Criar ordem de pagamento
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

// Capturar pagamento
export const capturePayPalOrder = async (orderId: string) => {
  try {
    return await callApi({ action: 'capture-order', orderId });
  } catch (error: any) {
    console.error('PayPal Capture Error:', error.message);
    throw error;
  }
};

// Verificar status da ordem
export const getOrderDetails = async (orderId: string) => {
  try {
    return await callApi({ action: 'order-details', orderId });
  } catch (error: any) {
    console.error('PayPal Get Order Error:', error);
    throw error;
  }
};
