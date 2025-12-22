import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AlertCircle, ArrowLeft, MessageSquare } from 'lucide-react';

const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center animate-fade-in-up border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-400"></div>
        
        <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 transform -rotate-6">
          <AlertCircle size={48} />
        </div>

        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Pagamento Interrompido</h2>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
          Notamos que você não concluiu seu checkout no PayPal. Houve algum problema técnico ou dúvida sobre o plano?
        </p>

        <div className="space-y-4">
          <Button 
            fullWidth 
            onClick={() => navigate('/upgrade')}
            className="py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-200"
          >
            Tentar Novamente
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={14} /> Voltar ao Início
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="flex items-center justify-center gap-2 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors"
            >
              <MessageSquare size={14} /> Suporte
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">OFERTA PREMIUM AINDA DISPONÍVEL</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;