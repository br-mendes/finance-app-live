import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap
} from 'lucide-react';
import { calculateFinancialHealth, FinancialHealth as FinancialHealthType } from '../../services/financialCalculations';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';

export const FinancialHealth: React.FC = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState<FinancialHealthType | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHealthData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await calculateFinancialHealth(user.id);
      setHealth(data);
    } catch (error) {
      console.error('Health Calculation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, [user?.id]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          icon: <CheckCircle size={24} />,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
          progressColor: 'bg-emerald-500',
          title: 'Saudável',
          description: 'Suas finanças estão em ótimo estado!'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} />,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50 dark:bg-amber-950/20',
          progressColor: 'bg-amber-500',
          title: 'Atenção',
          description: 'Algumas áreas precisam de cuidado.'
        };
      case 'critical':
        return {
          icon: <AlertCircle size={24} />,
          color: 'text-rose-500',
          bgColor: 'bg-rose-50 dark:bg-rose-950/20',
          progressColor: 'bg-rose-500',
          title: 'Crítico',
          description: 'Ação imediata recomendada.'
        };
      default:
        return {
          icon: <Activity size={24} />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          progressColor: 'bg-blue-500',
          title: 'Analisando...',
          description: 'Calculando pontuação...'
        };
    }
  };

  if (loading || !health) {
    return (
      <Card className="mb-8 animate-pulse border-none shadow-sm h-[320px]">
        <div className="space-y-6 h-full flex flex-col justify-center px-4">
          <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="flex gap-8">
            <div className="w-1/3 h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
            <div className="flex-1 space-y-4">
              <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const statusConfig = getStatusConfig(health.status);

  return (
    <Card className="mb-8 overflow-hidden relative border-none shadow-lg dark:bg-gray-900/50 backdrop-blur-xl">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${statusConfig.progressColor}`}></div>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Lado Esquerdo: Score & Gauge */}
        <div className="lg:w-1/3 space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-4">Saúde Financeira</h3>
            <div className={`p-4 rounded-2xl flex items-center gap-4 ${statusConfig.bgColor} border border-white/10`}>
              <div className={statusConfig.color}>{statusConfig.icon}</div>
              <div>
                <span className={`text-lg font-black block ${statusConfig.color}`}>{statusConfig.title}</span>
                <p className="text-[11px] font-medium text-gray-500">{statusConfig.description}</p>
              </div>
            </div>
          </div>
          
          <div className="relative pt-4 flex flex-col items-center lg:items-start">
             <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * health.score) / 100} className={`${statusConfig.color} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="absolute flex flex-col items-center">
                   <span className="text-4xl font-black text-gray-900 dark:text-white leading-none">{health.score}</span>
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
                </div>
             </div>
             <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Baseado em seu fluxo de caixa mensal</p>
          </div>
        </div>

        {/* Lado Direito: Métricas e Recomendações */}
        <div className="lg:w-2/3 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:shadow-inner">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Poupança</span>
                    {health.metrics.savingsRate >= 15 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                </div>
                <div className={`text-2xl font-black ${health.metrics.savingsRate >= 15 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {health.metrics.savingsRate.toFixed(1)}%
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">da receita total</p>
             </div>

             <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:shadow-inner">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Crédito</span>
                    {health.metrics.creditUtilization <= 30 ? <Zap size={14} className="text-emerald-500" /> : <TrendingUp size={14} className="text-rose-500" />}
                </div>
                <div className={`text-2xl font-black ${health.metrics.creditUtilization <= 30 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {health.metrics.creditUtilization.toFixed(1)}%
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">utilização do limite</p>
             </div>
          </div>

          <div className="bg-primary-50 dark:bg-primary-950/20 p-6 rounded-2xl border border-primary-100/50 dark:border-primary-900/50 flex-1">
             <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-primary-500" />
                <h4 className="text-xs font-black text-primary-900 dark:text-primary-400 uppercase tracking-widest">Plano de Evolução</h4>
             </div>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {health.recommendations.map((rec, i) => (
                   <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-snug">{rec}</span>
                   </li>
                ))}
                {health.recommendations.length === 0 && (
                   <div className="col-span-2 text-center py-4 text-emerald-600 font-bold text-sm italic">
                      🎯 Você está dominando sua vida financeira!
                   </div>
                )}
             </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};
