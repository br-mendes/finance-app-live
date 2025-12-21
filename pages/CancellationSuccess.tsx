import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { User, PlanType } from '../types';
import { Frown } from 'lucide-react';

interface CancellationSuccessProps {
    onUpdateUser: (user: User) => void;
}

export const CancellationSuccess: React.FC<CancellationSuccessProps> = ({ onUpdateUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Downgrade logic
    const storedUser = localStorage.getItem('financeapp_user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = { ...user, plan: PlanType.FREE };
        localStorage.setItem('financeapp_user', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);
    }
  }, [onUpdateUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
                <Frown className="h-10 w-10 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cancelamento concluído
            </h2>
            <p className="text-gray-600 mb-6">
                Que pena que você não quis continuar... Seu plano foi reduzido para <strong>FREE</strong>.
            </p>

            <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-lg text-left mb-6 space-y-2">
                <p><strong>Atenção:</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Seu acesso ao Radar do Mercado foi bloqueado.</li>
                    <li>A exportação de relatórios está desabilitada.</li>
                    <li>Você receberá alertas se tiver excedido o limite de 1 conta, 1 cartão ou 1 meta.</li>
                </ul>
            </div>

            <Button fullWidth onClick={() => navigate('/')}>
                Voltar ao Dashboard
            </Button>
        </div>
    </div>
  );
};