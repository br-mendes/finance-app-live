import { supabase } from './supabaseClient';

export interface FinancialMetrics {
  totalBalance: number;
  totalCreditLimit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  creditUsage: number;
  creditUtilization: number;
  savingsRate: number;
}

export interface FinancialHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  metrics: {
    savingsRate: number;
    creditUtilization: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
  recommendations: string[];
}

export interface ComparisonMetric {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface MonthlyComparison {
  income: ComparisonMetric;
  expenses: ComparisonMetric;
}

const getPeriodBoundaries = (monthsAgo: number = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
};

export const calculateDashboardMetrics = async (userId: string): Promise<FinancialMetrics> => {
  const { start, end } = getPeriodBoundaries(0);
  
  const [
    accountsData,
    cardsData,
    incomeData,
    expensesData
  ] = await Promise.all([
    supabase.from('accounts').select('balance').eq('user_id', userId),
    supabase.from('credit_cards').select('limit_amount').eq('user_id', userId),
    supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'receive').gte('date', start).lte('date', end),
    supabase.from('transactions').select('amount').eq('user_id', userId).in('type', ['debit', 'credit']).gte('date', start).lte('date', end)
  ]);
  
  const totalBalance = accountsData.data?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  const totalCreditLimit = cardsData.data?.reduce((sum, card) => sum + (card.limit_amount || 0), 0) || 0;
  const monthlyIncome = incomeData.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const monthlyExpenses = expensesData.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  
  // Credit usage based on active credit transactions in current billing cycle
  const { data: creditTransactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'credit')
    .gte('date', start)
    .lte('date', end);
  
  const creditUsage = creditTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const creditUtilization = totalCreditLimit > 0 ? (creditUsage / totalCreditLimit) * 100 : 0;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  
  return {
    totalBalance,
    totalCreditLimit,
    monthlyIncome,
    monthlyExpenses,
    netCashFlow: monthlyIncome - monthlyExpenses,
    creditUsage,
    creditUtilization,
    savingsRate
  };
};

export const calculateMonthlyComparison = async (userId: string): Promise<MonthlyComparison> => {
  const current = getPeriodBoundaries(0);
  const previous = getPeriodBoundaries(1);

  const fetchSum = async (type: 'receive' | 'expense', start: string, end: string) => {
    const query = supabase.from('transactions').select('amount').eq('user_id', userId);
    if (type === 'receive') {
      query.eq('type', 'receive');
    } else {
      query.in('type', ['debit', 'credit']);
    }
    const { data } = await query.gte('date', start).lte('date', end);
    return data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  };

  const [currInc, prevInc, currExp, prevExp] = await Promise.all([
    fetchSum('receive', current.start, current.end),
    fetchSum('receive', previous.start, previous.end),
    fetchSum('expense', current.start, current.end),
    fetchSum('expense', previous.start, previous.end)
  ]);

  const calcMetric = (curr: number, prev: number): ComparisonMetric => ({
    current: curr,
    previous: prev,
    change: curr - prev,
    changePercent: prev !== 0 ? ((curr - prev) / prev) * 100 : 0
  });

  return {
    income: calcMetric(currInc, prevInc),
    expenses: calcMetric(currExp, prevExp)
  };
};

export const calculateFinancialHealth = async (userId: string): Promise<FinancialHealth> => {
  const metrics = await calculateDashboardMetrics(userId);
  
  let score = 100;
  const recommendations: string[] = [];
  
  if (metrics.savingsRate < 10) {
    score -= 30;
    recommendations.push('Aumente sua taxa de poupança para pelo menos 10% da renda.');
  } else if (metrics.savingsRate < 20) {
    score -= 10;
    recommendations.push('Ótimo começo! Tente chegar a 20% de reserva mensal.');
  }
  
  if (metrics.creditUtilization > 70) {
    score -= 40;
    recommendations.push('Uso de crédito elevado. Tente reduzir para baixo de 30% do limite.');
  } else if (metrics.creditUtilization > 30) {
    score -= 15;
    recommendations.push('Sua utilização de crédito está moderada, mas pode melhorar.');
  }
  
  if (metrics.netCashFlow < 0) {
    score -= 20;
    recommendations.push('Atenção: Você gastou mais do que recebeu este mês.');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (score < 50) status = 'critical';
  else if (score < 80) status = 'warning';
  
  return {
    status,
    score,
    metrics: {
      savingsRate: metrics.savingsRate,
      creditUtilization: metrics.creditUtilization,
      monthlyIncome: metrics.monthlyIncome,
      monthlyExpenses: metrics.monthlyExpenses
    },
    recommendations
  };
};