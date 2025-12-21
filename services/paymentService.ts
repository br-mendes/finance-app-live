import { supabase } from './supabaseClient';
import { User } from '../types';

export const paymentService = {
  /**
   * Simulates the creation of a Mercado Pago preference.
   * In a real backend, this would call POST https://api.mercadopago.com/checkout/preferences
   */
  async createCheckoutSession(user: User) {
    console.log('Creating checkout preference for user:', user.id);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Construct the preference payload (Example of what would be sent to backend)
    const preferenceData = {
      items: [
        {
          title: 'FinanceAPP Premium',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 19.90,
        },
      ],
      payer: {
        email: user.email,
        name: user.first_name,
        surname: user.last_name,
        identification: {
            type: "CPF",
            number: user.cpf
        }
      },
      external_reference: user.id,
      back_urls: {
        success: `${window.location.origin}/#/payment-success`,
        failure: `${window.location.origin}/#/`,
        pending: `${window.location.origin}/#/`
      },
      auto_return: 'approved',
    };

    console.log('Payload sent to MP:', preferenceData);

    // MOCK RESPONSE: Return a URL to our internal mock page
    // In production, return response.body.init_point
    return {
      init_point: `#/mock-checkout?user_id=${user.id}&amount=19.90&plan=premium`
    };
  },

  /**
   * Simulates the Webhook logic that would run on the server after payment approval.
   * Updates Supabase tables.
   */
  async processSuccessfulPayment(userId: string, amount: number, mpPaymentId: string) {
    try {
        const startDate = new Date();
        const renewalDate = new Date();
        renewalDate.setDate(startDate.getDate() + 30);

        // 1. Insert into Payments table
        const { error: paymentError } = await supabase.from('payments').insert({
            user_id: userId,
            mercado_pago_id: mpPaymentId,
            amount: amount,
            status: 'approved',
            plan: 'premium',
            created_at: startDate.toISOString()
        });

        if (paymentError) throw paymentError;

        // 2. Update User Plan
        const { error: userError } = await supabase.from('users').update({
            plan: 'premium',
            plan_start_date: startDate.toISOString(),
            plan_renewal_date: renewalDate.toISOString()
        }).eq('id', userId);

        if (userError) throw userError;

        // Update local storage for immediate UI reflection
        const storedUser = localStorage.getItem('financeapp_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.id === userId) {
                const updated = { 
                    ...parsed, 
                    plan: 'premium', 
                    plan_start_date: startDate.toISOString(),
                    plan_renewal_date: renewalDate.toISOString()
                };
                localStorage.setItem('financeapp_user', JSON.stringify(updated));
            }
        }

        return true;
    } catch (error) {
        console.error('Error processing payment:', error);
        return false;
    }
  },

  async cancelSubscription(userId: string) {
      // Simulate API call to cancel in Mercado Pago
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update Supabase
      const { error } = await supabase.from('users').update({
          plan: 'free',
          plan_renewal_date: null
      }).eq('id', userId);

      if (error) throw error;
      return true;
  }
};