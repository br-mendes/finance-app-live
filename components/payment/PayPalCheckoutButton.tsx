import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../ui/Toast';
import { User, PlanType } from '../../types';
import { paymentService } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface PayPalCheckoutButtonProps {
  user: User;
  amount: number;
  planType?: 'monthly' | 'annual';
  onSuccess?: () => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({ user, amount, planType = 'monthly', onSuccess }) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const isInitializingRef = useRef(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    let checkCount = 0;
    const checkSdk = setInterval(() => {
      checkCount++;
      if (window.paypal && window.paypal.Buttons) {
        setSdkReady(true);
        clearInterval(checkSdk);
      }
      if (checkCount > 20) {
        clearInterval(checkSdk);
        console.error('PayPal SDK falhou ao carregar.');
      }
    }, 500);
    return () => clearInterval(checkSdk);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let paypalButtons: any = null;

    const initPayPal = async () => {
      if (!sdkReady || !paypalRef.current || isInitializingRef.current) return;
      if (paypalRef.current.children.length > 0) return;

      try {
        isInitializingRef.current = true;
        
        paypalButtons = window.paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: `FinanceApp Premium - Plano ${planType === 'annual' ? 'Anual' : 'Mensal'}`,
                  amount: {
                    currency_code: 'BRL',
                    value: amount.toFixed(2)
                  },
                  // FORMATO: premium_USERID_PLANTYPE_TIMESTAMP
                  custom_id: `premium_${user.id}_${planType}_${Date.now()}`
                }
              ]
            });
          },
          onApprove: async (data: any, actions: any) => {
            if (!isMounted) return;
            setLoading(true);
            try {
              const order = await actions.order.capture();
              
              // Processamento imediato no client-side
              const success = await paymentService.processSuccessfulPayment(
                user.id,
                amount,
                order.id
              );

              if (success && isMounted) {
                addToast('Pagamento aprovado!', 'success');
                onSuccess?.();
                navigate('/payment-success', { state: { user: { ...user, plan: PlanType.PREMIUM } } });
              }
            } catch (error: any) {
              console.error('Erro na captura:', error);
              if (isMounted) addToast('Erro ao confirmar pagamento.', 'error');
            } finally {
              if (isMounted) setLoading(false);
            }
          },
          onCancel: () => {
            if (isMounted) addToast('Pagamento cancelado.', 'info');
          },
          onError: (err: any) => {
            console.error('PayPal Error:', err);
            if (isMounted) addToast('Erro técnico no PayPal.', 'error');
          }
        });

        if (paypalRef.current && isMounted) {
          await paypalButtons.render(paypalRef.current).catch(() => {});
        }

      } catch (err) {
        console.error("Exceção na inicialização:", err);
        isInitializingRef.current = false;
      }
    };

    initPayPal();
    return () => { isMounted = false; };
  }, [sdkReady, user.id, amount, planType, addToast, navigate, onSuccess]);

  return (
    <div className="w-full space-y-4">
      {loading && (
        <div className="flex flex-col items-center justify-center py-4 text-primary-600 bg-white/50 rounded-xl">
          <Loader2 className="animate-spin mb-2" size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando com PayPal...</span>
        </div>
      )}
      {!sdkReady && !loading && (
        <div className="flex flex-col items-center justify-center py-8 opacity-50">
          <Loader2 className="animate-spin mb-2" size={20} />
          <span className="text-[9px] font-bold uppercase text-gray-400">Preparando Botão Seguro...</span>
        </div>
      )}
      <div 
        ref={paypalRef} 
        className="min-h-[150px] transition-all duration-500"
        style={{ opacity: sdkReady ? 1 : 0.4, pointerEvents: loading ? 'none' : 'auto' }}
      ></div>
    </div>
  );
};