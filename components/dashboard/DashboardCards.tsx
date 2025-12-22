import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { calculateDashboardMetrics, calculateMonthlyComparison } from '../../services/financialCalculations';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/Toast';

interface DashboardCardData {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const DashboardCards: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cards, setCards] = useState<DashboardCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [metrics, comparison] = await Promise.all([
        calculateDashboardMetrics(user.id),
        calculateMonthlyComparison(user.id)
      ]);

      const formatCurrency = (value: number) => 
        new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(value);

      const newCards: DashboardCardData[] = [
        {
          title: 'Saldo Total',
          value: formatCurrency(metrics.totalBalance),
          subtitle: 'em todas as contas',
          icon: <Wallet className="w-6 h-6" />,
          color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        },
        {
          title: 'Limite Disponível',
          value: formatCurrency(metrics.totalCreditLimit - metrics.creditUsage),
          subtitle: `de ${formatCurrency(metrics.totalCreditLimit)}`,
          icon: <CreditCard className="w-6 h-6" />,
          color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          trend: {
            value: metrics.creditUtilization,
            isPositive: metrics.creditUtilization < 30
          }
        },
        {
          title: 'Receitas (Mês)',
          value: formatCurrency(metrics.monthlyIncome),
          subtitle: comparison.income.change >= 0 
            ? `+${formatCurrency(comparison.income.change)} MoM` 
            : `${formatCurrency(comparison.income.change)} MoM`,
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
          trend: {
            value: comparison.income.changePercent,
            isPositive: comparison.income.changePercent >= 0
          }
        },
        {
          title: 'Despesas (Mês)',
          value: formatCurrency(metrics.monthlyExpenses),
          subtitle: comparison.expenses.change >= 0 
            ? `+${formatCurrency(comparison.expenses.change)} MoM` 
            : `${formatCurrency(comparison.expenses.change)} MoM`,
          icon: <TrendingDown className="w-6 h-6" />,
          color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
          trend: {
            value: Math.abs(comparison.expenses.changePercent),
            isPositive: comparison.expenses.changePercent <= 0
          }
        }
      ];

      setCards(newCards);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard cards:', error);
      addToast('Erro ao carregar métricas do dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 animate-pulse border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-3 flex-1">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-7 bg-gray-100 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-40"></div>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Visão Geral</h2>
        {lastUpdated && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
            <span>Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}</span>
            <button onClick={loadData} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {card.title}
                </h3>
                <div className="mt-2">
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {card.value}
                  </div>
                  <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-tight">
                    {card.subtitle}
                  </p>
                </div>
              </div>
              <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${card.color}`}>
                {card.icon}
              </div>
            </div>
            
            {card.trend && (
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest">
                {card.trend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-rose-500 mr-1" />
                )}
                <span className={card.trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                  {Math.abs(card.trend.value).toFixed(1)}%
                </span>
                <span className="text-gray-400 ml-2">Análise</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};