import React from 'react';
import { PayPalCheckoutButton } from './PayPalCheckoutButton';
import { User } from '../../types';

interface PayPalCheckoutProps {
  userId: string;
  userEmail: string;
  userName: string;
  planType: 'monthly' | 'annual';
  onSuccess: () => void;
  onCancel: () => void;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  userId,
  userEmail,
  userName,
  planType,
  onSuccess,
  onCancel
}) => {
  const amount = planType === 'monthly' ? 19.90 : 179.00;

  const mockUser = {
    id: userId,
    email: userEmail,
    first_name: userName.split(' ')[0],
    last_name: userName.split(' ').slice(1).join(' ')
  } as User;

  return (
    <div className="w-full animate-fade-in-up">
      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
           <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" className="h-4" alt="PayPal" />
        </div>
        <div className="text-left">
           <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none">Checkout Seguro</p>
           <p className="text-[9px] font-bold text-amber-600 uppercase mt-1">PayPal Gateway Oficial</p>
        </div>
      </div>
      
      <PayPalCheckoutButton 
        user={mockUser} 
        amount={amount} 
        onSuccess={onSuccess}
      />
      
      <button 
        onClick={onCancel}
        className="w-full mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
      >
        Cancelar Pagamento
      </button>
    </div>
  );
};