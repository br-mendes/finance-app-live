
import React, { useState } from 'react';
import { Check, X, Crown, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PayPalCheckoutButton } from '../components/payment/PayPalCheckoutButton';
import { PaymentMethodSelector } from '../components/payment/PaymentMethodSelector';
import { useToast } from '../components/ui/Toast';
// Fix: Import Card component
import { Card } from '../components/ui/Card';

export const Plans: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<'mercado-pago' | 'paypal' | undefined>();

  const handleMercadoPago = () => {
    addToast('Redirecionando para Mercado Pago...', 'info');
    // Implementação do fluxo de redirecionamento Mercado Pago
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 pb-32 animate-fade-in-up">
      <div className="text-center space-y-6 mb-20">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary-100">
          <Sparkles size={14} /> Inteligência que evolui
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
          Escolha seu <span className="text-primary-600">poder</span>.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
          Assuma o controle total da sua vida financeira com ferramentas de nível institucional.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Lado Esquerdo: Cards de Plano */}
        <div className="lg:col-span-7 grid md:grid-cols-2 gap-8">
          {/* FREE */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 flex flex-col h-full hover:shadow-xl transition-all">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Essencial</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black text-gray-900">Grátis</span>
            </div>
            <ul className="space-y-5 mb-12 flex-1">
              <Feature included text="1 Conta Bancária" />
              <Feature included text="1 Cartão de Crédito" />
              <Feature included text="1 Meta Ativa" />
              <Feature included={false} text="Radar do Mercado IA" />
            </ul>
            <Link to="/register">
              <Button variant="outline" fullWidth size="lg" className="rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest">Ativar Grátis</Button>
            </Link>
          </div>

          {/* PREMIUM */}
          <div className="bg-[#0f172a] text-white rounded-[3.5rem] shadow-2xl p-10 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-primary-600 text-[9px] font-black px-5 py-2 rounded-bl-2xl uppercase tracking-widest">Pro</div>
            <h3 className="text-xs font-black text-primary-400 uppercase tracking-widest mb-6">Premium</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black">R$ 19,90</span>
              <span className="text-lg font-bold text-gray-500">/mês</span>
            </div>
            <ul className="space-y-5 mb-12 flex-1">
              <Feature included text="Contas Ilimitadas" strong />
              <Feature included text="Cartões Ilimitados" strong />
              <Feature included text="Radar IA Gemini 3" strong />
              <Feature included text="Exportação de Relatórios" />
            </ul>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
              <ShieldCheck className="text-primary-500" size={20} />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Segurança de dados bancária</span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Checkout Seletor */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          {user ? (
            <>
              <PaymentMethodSelector 
                planType="monthly" 
                selectedMethod={selectedMethod}
                onMethodSelect={setSelectedMethod}
              />
              
              <div className="animate-fade-in-up">
                {selectedMethod === 'paypal' && (
                  <div className="p-8 bg-white rounded-3xl shadow-xl border-2 border-primary-500 animate-fade-in-up">
                    <PayPalCheckoutButton user={user} amount={19.90} />
                  </div>
                )}
                
                {selectedMethod === 'mercado-pago' && (
                  <Button 
                    fullWidth 
                    size="lg" 
                    onClick={handleMercadoPago}
                    className="bg-[#009EE3] hover:bg-[#008CC9] border-none py-6 rounded-3xl font-black text-lg shadow-2xl shadow-blue-500/20"
                  >
                    Pagar com Mercado Pago
                  </Button>
                )}

                {!selectedMethod && (
                  <div className="p-12 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <Crown size={40} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      Selecione um método<br/>para ativar o Premium
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center rounded-[3rem]">
              <h3 className="text-2xl font-black text-gray-900 mb-4">Crie sua conta</h3>
              <p className="text-gray-500 mb-10 font-medium">É necessário estar logado para processar sua assinatura de forma segura.</p>
              <Link to="/register">
                <Button fullWidth size="lg" className="rounded-2xl py-5 shadow-xl shadow-primary-500/20">Cadastrar Gratuitamente</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const Feature = ({ included, text, strong }: any) => (
  <li className="flex items-center gap-4">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${included ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
      {included ? <Check size={12} strokeWidth={4} /> : <X size={12} />}
    </div>
    <span className={`text-sm ${strong ? 'font-black' : 'font-medium'} ${included ? '' : 'opacity-40 line-through'}`}>{text}</span>
  </li>
);
