import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
    PieChart, Pie, Legend, LineChart, Line 
} from 'recharts';
import { dataManager } from '../utils/dataManager';
import { TransactionType } from '../types';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#84cc16'];

export const Dashboard: React.FC = () => {
  const [dateFilter, setDateFilter] = useState('30');
  
  // Real Data State
  const [stats, setStats] = useState({
      totalBalance: 0,
      totalLimit: 0, // Total available limit
      monthlyIncome: 0,
      monthlyExpenses: 0
  });

  const [dataPie, setDataPie] = useState<{name: string, value: number}[]>([]);
  const [dataBar, setDataBar] = useState<{name: string, value: number}[]>([]);
  const [dataLine, setDataLine] = useState<{day: string, atual: number, anterior: number}[]>([]);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'attention' | 'critical'>('healthy');

  useEffect(() => {
      // Load Data
      const transactions = dataManager.getTransactions();
      const accounts = dataManager.getAccounts();
      const cards = dataManager.getCards();

      // 1. Stats
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      const totalLimit = cards.reduce((sum, c) => sum + c.limit_amount, 0); // available
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyTrans = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const monthlyIncome = monthlyTrans
          .filter(t => t.type === TransactionType.RECEIVE)
          .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = monthlyTrans
          .filter(t => t.type === TransactionType.DEBIT || t.type === TransactionType.CREDIT)
          .reduce((sum, t) => sum + t.amount, 0);

      setStats({ totalBalance, totalLimit, monthlyIncome, monthlyExpenses });

      // 2. Health Logic
      // Ratio of Expenses/Income
      // Or Credit Limit usage? We only know available limit.
      // Simple logic: Expense > Income = Critical. Expense > 80% Income = Attention.
      if (monthlyExpenses > monthlyIncome && monthlyIncome > 0) {
          setHealthStatus('critical');
      } else if (monthlyExpenses > monthlyIncome * 0.8) {
          setHealthStatus('attention');
      } else {
          setHealthStatus('healthy');
      }

      // 3. Charts Data (Based on Date Filter)
      const days = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const periodTrans = transactions.filter(t => new Date(t.date) >= cutoffDate);

      // Pie Chart (Categories)
      const catMap = new Map<string, number>();
      periodTrans.filter(t => t.type === TransactionType.DEBIT || t.type === TransactionType.CREDIT).forEach(t => {
          catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
      });
      const pieData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));
      setDataPie(pieData);

      // Bar Chart (Types)
      const typeMap = { [TransactionType.DEBIT]: 0, [TransactionType.CREDIT]: 0, [TransactionType.RECEIVE]: 0 };
      periodTrans.forEach(t => {
          typeMap[t.type] += t.amount;
      });
      setDataBar([
          { name: 'Débito', value: typeMap[TransactionType.DEBIT] },
          { name: 'Crédito', value: typeMap[TransactionType.CREDIT] },
          { name: 'Receita', value: typeMap[TransactionType.RECEIVE] },
      ]);

      // Line Chart (Daily Evolution)
      // Group by day for the last 'days'
      // Simplified: Just 7 days or so for visualization? No, use full period.
      // If 30 days, too many points. Group by chunks?
      // Let's do simple daily grouping for the filtered period.
      const lineMap = new Map<string, number>();
      periodTrans.filter(t => t.type === TransactionType.DEBIT || t.type === TransactionType.CREDIT).forEach(t => {
          const d = new Date(t.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
          lineMap.set(d, (lineMap.get(d) || 0) + t.amount);
      });
      const lineData = Array.from(lineMap.entries())
        .map(([day, atual]) => ({ day, atual, anterior: 0 }))
        .sort((a,b) => a.day.localeCompare(b.day)) // approximate sort
        .slice(-10); // Show last 10 points to avoid crowding
      setDataLine(lineData);

  }, [dateFilter]);

  const getHealthBadge = () => {
      switch(healthStatus) {
          case 'healthy':
              return { 
                  color: 'bg-green-100 text-green-800', 
                  dot: 'bg-green-500', 
                  text: 'Saudável',
                  icon: <CheckCircle size={20} className="text-green-600 mb-2" />,
                  tip: "Parabéns! Suas receitas superam suas despesas."
              };
          case 'attention':
              return { 
                  color: 'bg-yellow-100 text-yellow-800', 
                  dot: 'bg-yellow-500', 
                  text: 'Atenção',
                  icon: <AlertTriangle size={20} className="text-yellow-600 mb-2" />,
                  tip: "Cuidado, seus gastos estão próximos da sua renda."
              };
          case 'critical':
              return { 
                  color: 'bg-red-100 text-red-800', 
                  dot: 'bg-red-500', 
                  text: 'Crítico',
                  icon: <AlertTriangle size={20} className="text-red-600 mb-2" />,
                  tip: "Suas despesas superaram a renda. Reveja seu orçamento urgente."
              };
          default:
              return { color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500', text: 'Analisando...', icon: null, tip: '' };
      }
  };

  const status = getHealthBadge();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Geral</h1>
          <p className="text-sm text-gray-500">Visão completa da sua saúde financeira</p>
        </div>
        <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                <span className={`w-2 h-2 ${status.dot} rounded-full mr-2`}></span>
                Saúde Financeira: {status.text}
            </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Saldo em Contas</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalBalance)}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Limite Disponível</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalLimit)}
              </h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <CreditCard size={20} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Receitas (Mês)</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthlyIncome)}
              </h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Despesas (Mês)</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthlyExpenses)}
              </h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Health Tip Section */}
      <Card className={`${status.color.replace('text-', 'bg-').replace('800', '50')} border-none`}>
          <div className="flex items-start gap-3">
              <div className="mt-1">{status.icon}</div>
              <div>
                  <h4 className="font-bold text-gray-900">Análise de Saúde Financeira</h4>
                  <p className="text-sm text-gray-700 mt-1">{status.tip}</p>
              </div>
          </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Gastos por Categoria</h3>
            <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            >
                <option value="7">Últimos 7 dias</option>
                <option value="15">Últimos 15 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
            </select>
          </div>
          <div className="h-72">
             {dataPie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {dataPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value}`} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
                </ResponsiveContainer>
             ) : (
                 <div className="h-full flex items-center justify-center text-gray-400">Sem dados para o período</div>
             )}
          </div>
        </Card>

        {/* Expenses by Type Bar Chart */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Gastos por Tipo</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBar} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => `R$ ${value}`}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {dataBar.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Comparison Line Chart */}
        <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Evolução Diária</h3>
                    <p className="text-xs text-gray-500">Últimos lançamentos</p>
                </div>
            </div>
            <div className="h-80">
                {dataLine.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataLine} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="atual" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Valor" />
                    </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">Sem dados suficientes</div>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
};