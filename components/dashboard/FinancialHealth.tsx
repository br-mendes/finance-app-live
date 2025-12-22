import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  Sparkles
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
      console.error('Error loading financial health:', error);
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
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          title: 'Saudável',
          description: 'Suas finanças estão em ótimo estado!'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} />,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          title: 'Atenção',
          description: 'Algumas áreas precisam de cuidado imediato.'
        };
      case 'critical':
        return {
          icon: <AlertCircle size={24} />,
          color: 'text-rose-600',
          bgColor: 'bg-rose-50 dark:bg-rose-900/20',
          title: 'Crítico',
          description: 'Ação imediata recomendada para evitar dívidas.'
        };
      default:
        return {
          icon: <Activity size={24} />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          title: 'Analisando...',
          description: 'Calculando sua saúde financeira.'
        };
    }
  };

  if (loading || !health) {
    return (
      <Card className="mb-8 animate-pulse">
        <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-full"></div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
              <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
           </div>
        </div>
      </Card>
    );
  }

  const statusConfig = getStatusConfig(health.status);

  return (
    <Card className="mb-8 overflow-hidden relative border-none shadow-sm dark:bg-gray-800">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Score & Status */}
        <div className="lg:w-1/3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Saúde Financeira</h3>
            <div className={`p-5 rounded-2xl flex items-center gap-4 ${statusConfig.bgColor} ${statusConfig.color} border border-current/10`}>
              <div className="shrink-0">{statusConfig.icon}</div>
              <div>
                <span className="text-lg font-black block">{statusConfig.title}</span>
                <p className="text-xs font-medium opacity-80">{statusConfig.description}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center lg:text-left">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-5xl font-black text-gray-900 dark:text-white">{health.score}</span>
              <span className="text-xl font-bold text-gray-400">/100</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Pontuação de Saúde</p>
          </div>
        </div>

        {/* Center: Detailed Metrics */}
        <div className="lg:w-2/3 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <MetricBox 
              label="Poupança" 
              value={`${health.metrics.savingsRate.toFixed(1)}%`} 
              sub="da receita bruta" 
              positive={health.metrics.savingsRate >= 15}
            />
            <MetricBox 
              label="Uso de Crédito" 
              value={`${health.metrics.creditUtilization.toFixed(1)}%`} 
              sub="do limite total" 
              positive={health.metrics.creditUtilization <= 30}
              reverse
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-primary-500" />
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Plano de Melhoria</h4>
            </div>
            <ul className="space-y-3">
              {health.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></div>
                  {rec}
                </li>
              ))}
              {health.recommendations.length === 0 && (
                <li className="text-xs font-bold text-emerald-600 flex items-center gap-2 italic">
                  <CheckCircle size={14} /> Você está seguindo todas as boas práticas financeiras!
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

const MetricBox = ({ label, value, sub, positive, reverse }: any) => {
  const isGood = reverse ? !positive : positive;
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        {positive ? (
          <TrendingUp size={14} className="text-emerald-500" />
        ) : (
          <TrendingDown size={14} className="text-rose-500" />
        )}
      </div>
      <div className={`text-xl font-black ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {value}
      </div>
      <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{sub}</p>
    </div>
  );
};