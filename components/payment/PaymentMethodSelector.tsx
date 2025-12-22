import React from 'react';
import { CreditCard, Globe, Lock, Check } from 'lucide-react';

interface PaymentMethodSelectorProps {
  planType: 'monthly' | 'annual';
  onMethodSelect: (method: 'mercado-pago' | 'paypal') => void;
  selectedMethod?: 'mercado-pago' | 'paypal';
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  planType,
  onMethodSelect,
  selectedMethod
}) => {
  const price = planType === 'monthly' ? 'R$ 19,90/mês' : 'R$ 179,00/ano';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
        Forma de Pagamento
      </h3>
      
      <div className="mb-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-[2rem] border border-primary-100 dark:border-primary-800 flex justify-between items-center">
        <div>
          <div className="font-black text-2xl text-primary-900 dark:text-primary-100">{price}</div>
          <div className="text-xs font-bold text-primary-600 uppercase tracking-widest mt-1">
            {planType === 'monthly' ? 'Plano Mensal' : 'Plano Anual (Economia de 25%)'}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full">
          <Lock size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Seguro</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Mercado Pago */}
        <button
          onClick={() => onMethodSelect('mercado-pago')}
          className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
            selectedMethod === 'mercado-pago'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
              : 'border-gray-100 dark:border-gray-700 hover:border-primary-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedMethod === 'mercado-pago' ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
            }`}>
              {selectedMethod === 'mercado-pago' && <Check size={14} className="text-white" />}
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 dark:text-white">Mercado Pago</div>
              <div className="text-[10px] text-gray-500 font-medium">Cartão, PIX ou Boleto</div>
            </div>
          </div>
          <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-0.png" alt="MP" className="h-4 grayscale group-hover:grayscale-0 transition-all" />
        </button>

        {/* PayPal */}
        <button
          onClick={() => onMethodSelect('paypal')}
          className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
            selectedMethod === 'paypal'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
              : 'border-gray-100 dark:border-gray-700 hover:border-primary-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedMethod === 'paypal' ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
            }`}>
              {selectedMethod === 'paypal' && <Check size={14} className="text-white" />}
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 dark:text-white">PayPal</div>
              <div className="text-[10px] text-gray-500 font-medium">Cartão Internacional ou Saldo</div>
            </div>
          </div>
          <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" className="h-6 grayscale group-hover:grayscale-0 transition-all" />
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
        <Lock size={12} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Criptografia SSL de 256 bits</span>
      </div>
    </div>
  );
};