import React, { useState } from 'react';
import { createPremiumCheckout } from '../../services/mercadoPago';
import { User } from '../../types';
import { useToast } from '../ui/Toast';
import { Crown, Sparkles, Loader2 } from 'lucide-react';
import { logAction } from '../../services/supabaseClient';

interface CheckoutButtonProps {
  user: User;
  planType: 'monthly' | 'annual';
  className?: string;
  children?: React.ReactNode;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  user,
  planType, 
  className = '',
  children 
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    if (!user) {
      addToast('Faça login para continuar', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await logAction(user.id, 'INITIATE_CHECKOUT', { planType });

      const checkoutData = {
        userId: user.id,
        userEmail: user.email,
        userName: `${user.first_name} ${user.last_name}`,
        userCPF: user.cpf || '',
        planType
      };
      
      const { checkoutUrl } = await createPremiumCheckout(checkoutData);
      
      window.location.href = checkoutUrl;
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      addToast(error.message || 'Erro ao processar pagamento', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const price = planType === 'monthly' ? 'R$ 19,90/mês' : 'R$ 179,00/ano';
  
  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`
        relative inline-flex items-center justify-center
        px-8 py-4 text-lg font-bold
        text-white bg-gradient-to-r from-primary-600 to-indigo-600
        rounded-2xl hover:from-primary-700 hover:to-indigo-700
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
          Preparando...
        </>
      ) : children || (
        <>
          <Crown className="mr-3 h-5 w-5 text-amber-300" />
          Assinar Premium — {price}
          <Sparkles className="ml-3 h-5 w-5 opacity-50" />
        </>
      )}
    </button>
  );
};