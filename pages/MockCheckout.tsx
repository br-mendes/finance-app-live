import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { Shield, Lock, CreditCard, Check, User } from 'lucide-react';

export const MockCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const userId = searchParams.get('user_id');
  const amount = searchParams.get('amount') || '19.90';

  const handlePayment = async () => {
    if (!userId) return;
    setProcessing(true);

    // Simulate MP processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockPaymentId = `mp-${Date.now()}`;
    const success = await paymentService.processSuccessfulPayment(userId, parseFloat(amount), mockPaymentId);

    if (success) {
        // Fetch updated user to pass to success page
        const storedUser = localStorage.getItem('financeapp_user');
        const user = storedUser ? JSON.parse(storedUser) : { id: userId };
        
        // Ensure the plan is updated in the object passed
        const updatedUser = { ...user, plan: 'premium' };
        
        navigate('/payment-success', { state: { user: updatedUser } });
    } else {
        alert('Erro ao processar pagamento. Tente novamente.');
        setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Product Info */}
        <div className="bg-[#009EE3] p-8 text-white md:w-1/2 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-wide">Mercado Pago</span>
                </div>
                
                <div className="space-y-2">
                    <p className="text-white/80 text-sm uppercase font-semibold">Você está pagando</p>
                    <h1 className="text-3xl font-bold">FinanceAPP Premium</h1>
                    <div className="flex items-baseline mt-4">
                        <span className="text-lg opacity-80">R$</span>
                        <span className="text-5xl font-bold ml-1">{amount}</span>
                    </div>
                    <p className="text-white/80 text-sm mt-2">Assinatura Mensal</p>
                </div>
            </div>

            {/* Decorative Circles */}
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="mt-8 relative z-10">
                <ul className="space-y-3 text-sm">
                    <li className="flex items-center"><Check className="h-4 w-4 mr-2" /> Contas e Cartões Ilimitados</li>
                    <li className="flex items-center"><Check className="h-4 w-4 mr-2" /> Radar de Mercado com IA</li>
                    <li className="flex items-center"><Check className="h-4 w-4 mr-2" /> Relatórios em PDF</li>
                </ul>
            </div>
        </div>

        {/* Right Side: Payment Form Simulation */}
        <div className="p-8 md:w-1/2 bg-white">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Detalhes do Pagamento</h2>
                <p className="text-sm text-gray-500">Ambiente seguro de teste</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número do Cartão</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            value="4556 7890 1234 5678" 
                            disabled 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-mono"
                        />
                        <div className="absolute right-3 top-3 h-4 w-8 bg-blue-900 rounded opacity-50"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Validade</label>
                        <input 
                            type="text" 
                            value="12/28" 
                            disabled 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-center"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVV</label>
                        <input 
                            type="text" 
                            value="***" 
                            disabled 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-center"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome no Cartão</label>
                    <input 
                        type="text" 
                        value="TESTE USER" 
                        disabled 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                    />
                </div>

                <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full mt-6 bg-[#009EE3] hover:bg-[#008CC9] text-white font-bold py-3 rounded-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {processing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processando...
                        </>
                    ) : (
                        `Pagar R$ ${amount}`
                    )}
                </button>

                <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
                    <Lock className="h-3 w-3 mr-1" /> Pagamento 100% seguro simulado
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};