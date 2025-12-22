import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { capturePayPalOrder, getOrderDetails } from '../services/paypal/client';
import { supabase } from '../services/supabaseClient';
import { CheckCircle, XCircle, Loader2, PartyPopper } from 'lucide-react';
import { PlanType } from '../types';
import { useToast } from '../components/ui/Toast';

const PayPalReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando seu retorno...');
  const processingRef = useRef(false);

  useEffect(() => {
    const processReturn = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Sessão de pagamento não localizada.');
        return;
      }

      try {
        const captureResult = await capturePayPalOrder(token);
        
        if (captureResult.status === 'COMPLETED' || captureResult.name === 'RESOURCE_ALREADY_CAPTURED') {
          const orderDetails = await getOrderDetails(token);
          const purchaseUnit = orderDetails.purchase_units[0];
          const customId = purchaseUnit.custom_id;
          
          if (!customId) throw new Error('Dados de rastreamento ausentes.');

          // Parse: premium_{userId}_{planType}_{timestamp}
          const parts = customId.split('_');
          const userId = parts[1];
          const planType = parts[2];

          if (!userId) throw new Error('Identificação do usuário falhou.');

          const renewalDate = new Date();
          renewalDate.setMonth(renewalDate.getMonth() + (planType === 'annual' ? 12 : 1));
          
          // 1. DB Persistence
          await supabase.from('users').update({
            plan: PlanType.PREMIUM,
            plan_renewal_date: renewalDate.toISOString()
          }).eq('id', userId);

          await supabase.from('payments').upsert({
            user_id: userId,
            paypal_order_id: token,
            amount: parseFloat(purchaseUnit.amount.value),
            status: 'approved',
            plan: PlanType.PREMIUM,
            payment_method: 'paypal',
            created_at: new Date().toISOString()
          }, { onConflict: 'paypal_order_id' });

          // 2. Local State Sync
          const stored = localStorage.getItem('financeapp_user');
          if (stored) {
            const user = JSON.parse(stored);
            localStorage.setItem('financeapp_user', JSON.stringify({ ...user, plan: PlanType.PREMIUM }));
          }

          setStatus('success');
          setMessage('Upgrade concluído com sucesso!');
          addToast('Conta Premium Ativa!', 'success');
          setTimeout(() => navigate('/'), 3000);
        } else {
          throw new Error('O pagamento não foi validado pelo PayPal.');
        }
      } catch (error: any) {
        console.error('PayPal Return Error:', error);
        setStatus('error');
        setMessage(error.message || 'Erro ao ativar sua assinatura.');
      }
    };

    processReturn();
  }, [searchParams, navigate, addToast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center animate-fade-in-up border border-gray-100">
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="relative inline-flex">
              <div className="w-20 h-20 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
              <Loader2 className="absolute inset-0 m-auto text-primary-600" size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Finalizando Upgrade</h2>
            <p className="text-gray-500 font-medium">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto">
              <PartyPopper size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Você é Premium!</h2>
            <p className="text-emerald-600 font-bold bg-emerald-50 py-3 rounded-2xl">{message}</p>
            <p className="text-xs text-gray-400 font-medium italic">Carregando seu novo painel...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Falha na Ativação</h2>
            <p className="text-gray-500 font-medium px-4">{message}</p>
            <button 
              onClick={() => navigate('/upgrade')}
              className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-500/20"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayPalReturnPage;