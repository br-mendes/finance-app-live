import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { User } from '../types';
import { emailService } from '../services/emailService';

interface PaymentSuccessProps {
    onLogin: (user: User) => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const user = location.state?.user as User;
  const emailSentRef = useRef(false);

  useEffect(() => {
    // If no user state (accessed directly), redirect to login
    if (!user) {
        navigate('/login');
        return;
    }

    // Send email only once
    if (!emailSentRef.current) {
        emailService.sendPremiumConfirmation(user).catch(console.error);
        emailSentRef.current = true;
    }

    const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
        onLogin(user);
        navigate('/');
    }, 5000);

    return () => {
        clearInterval(timer);
        clearTimeout(redirect);
    };
  }, [navigate, onLogin, user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Obrigado pela compra!
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
                Você fez a melhor escolha para acompanhar sua vida financeira. Seu plano <span className="font-bold text-primary-600">Premium</span> já está ativo.
                <br/><span className="text-sm mt-2 block">Um email de confirmação foi enviado para você.</span>
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-500 mb-2">Redirecionando para o Dashboard em</p>
                <div className="text-4xl font-bold text-gray-900">{countdown}</div>
            </div>

            <div className="flex items-center justify-center text-gray-400 text-sm">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Carregando seu ambiente...
            </div>
        </div>
    </div>
  );
};