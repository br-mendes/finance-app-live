import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PaymentMethodSelector } from '../components/payment/PaymentMethodSelector';
import { PayPalCheckout } from '../components/payment/PayPalCheckout';
import { CheckoutButton } from '../components/payment/CheckoutButton';
import { useToast } from '../components/ui/Toast';
import { Crown, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [planType, setPlanType] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'mercado-pago' | 'paypal'>();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePaymentSuccess = () => {
    addToast('Pagamento confirmado! Ativando recursos...', 'success');
    setTimeout(() => navigate('/'), 2000);
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    addToast('Operação cancelada', 'info');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 animate-fade-in-up pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary-100">
            <Zap size={14} className="fill-current" /> Upgrade Vitalício
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
            Seja <span className="text-primary-600">Premium</span>.
          </h1>
          <p className="text-lg text-gray-500 font-medium">Desbloqueie o potencial máximo da sua inteligência financeira.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plano Mensal */}
              <div
                className={`p-8 rounded-[2.5rem] border-4 transition-all relative overflow-hidden group cursor-pointer ${
                  planType === 'monthly'
                    ? 'border-primary-500 bg-white shadow-2xl'
                    : 'border-white bg-white/50 hover:border-gray-100'
                }`}
                onClick={() => { setPlanType('monthly'); setShowCheckout(false); }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">Mensal</h3>
                    <div className="text-4xl font-black text-gray-900 mt-2">R$ 19,90</div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center ${planType === 'monthly' ? 'bg-primary-500 border-primary-100' : 'border-gray-100'}`}>
                  {planType === 'monthly' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </div>

              {/* Plano Anual */}
              <div
                className={`p-8 rounded-[2.5rem] border-4 transition-all relative overflow-hidden group cursor-pointer ${
                  planType === 'annual'
                    ? 'border-primary-500 bg-white shadow-2xl'
                    : 'border-white bg-white/50 hover:border-gray-100'
                }`}
                onClick={() => { setPlanType('annual'); setShowCheckout(false); }}
              >
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest">Economize 25%</div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">Anual</h3>
                    <div className="text-4xl font-black text-gray-900 mt-2">R$ 179,00</div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center ${planType === 'annual' ? 'bg-primary-500 border-primary-100' : 'border-gray-100'}`}>
                  {planType === 'annual' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
               <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">O que você recebe:</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Benefit text="Contas Ilimitadas" />
                  <Benefit text="Cartões Ilimitados" />
                  <Benefit text="Radar IA Gemini 3" />
                  <Benefit text="Relatórios em PDF" />
                  <Benefit text="Metas Ilimitadas" />
                  <Benefit text="Suporte Prioritário" />
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 sticky top-24">
            {!showCheckout ? (
              <PaymentMethodSelector
                planType={planType}
                onMethodSelect={(m) => setPaymentMethod(m)}
                selectedMethod={paymentMethod}
              />
            ) : null}
            
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
              <h3 className="font-black text-lg text-gray-900 mb-6">Resumo da Assinatura</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400 uppercase tracking-widest text-[10px]">Plano</span>
                  <span className="text-gray-900">{planType === 'monthly' ? 'Premium Mensal' : 'Premium Anual'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400 uppercase tracking-widest text-[10px]">Gateway</span>
                  <span className="text-gray-900">
                    {paymentMethod === 'mercado-pago' ? 'Mercado Pago' : 
                     paymentMethod === 'paypal' ? 'PayPal' : 'Não selecionado'}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-50 flex justify-between items-baseline">
                  <span className="text-gray-900 font-black text-xl">Total</span>
                  <span className="text-primary-600 font-black text-3xl">
                    {planType === 'monthly' ? 'R$ 19,90' : 'R$ 179,00'}
                  </span>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  onClick={() => paymentMethod && setShowCheckout(true)}
                  disabled={!paymentMethod}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                >
                  Confirmar e Pagar <Zap size={16} className="text-amber-400 fill-current" />
                </button>
              ) : paymentMethod === 'paypal' ? (
                <PayPalCheckout
                  userId={user.id}
                  userEmail={user.email}
                  userName={`${user.first_name} ${user.last_name}`}
                  planType={planType}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              ) : (
                <CheckoutButton
                  user={user}
                  planType={planType}
                  className="w-full py-5 rounded-2xl"
                />
              )}

              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-emerald-500">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Ambiente 100% Seguro</span>
                </div>
                <p className="text-[8px] text-gray-400 font-medium text-center leading-relaxed">
                  Sua assinatura será processada de forma criptografada.<br/>Acesso premium liberado instantaneamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Benefit = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
    <span className="text-sm font-bold text-gray-600">{text}</span>
  </div>
);

export default UpgradePage;