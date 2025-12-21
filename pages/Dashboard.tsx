import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
    PieChart, Pie, Legend, LineChart, Line 
} from 'recharts';

// Mock Data
const dataBar = [
  { name: 'Débito', value: 1200 },
  { name: 'Crédito', value: 900 },
  { name: 'Receita', value: 4500 },
];

const dataPie = [
  { name: 'Moradia', value: 1500 },
  { name: 'Alimentação', value: 800 },
  { name: 'Transporte', value: 400 },
  { name: 'Lazer', value: 300 },
  { name: 'Outros', value: 200 },
];

const dataLine = [
  { day: '01', atual: 100, anterior: 80 },
  { day: '05', atual: 300, anterior: 250 },
  { day: '10', atual: 600, anterior: 550 },
  { day: '15', atual: 1200, anterior: 1100 },
  { day: '20', atual: 1800, anterior: 2100 },
  { day: '25', atual: 2340, anterior: 2800 },
  { day: '30', atual: 2800, anterior: 3200 },
];

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC = () => {
  const [dateFilter, setDateFilter] = useState('30');

  // Simulated Financial Health Logic
  const healthStatus = 'healthy' as 'healthy' | 'attention' | 'critical';
  const getHealthBadge = () => {
      switch(healthStatus) {
          case 'healthy':
              return { 
                  color: 'bg-green-100 text-green-800', 
                  dot: 'bg-green-500', 
                  text: 'Saudável',
                  icon: <CheckCircle size={20} className="text-green-600 mb-2" />,
                  tip: "Parabéns! Suas receitas superam suas despesas e o uso do cartão está controlado."
              };
          case 'attention':
              return { 
                  color: 'bg-yellow-100 text-yellow-800', 
                  dot: 'bg-yellow-500', 
                  text: 'Atenção',
                  icon: <AlertTriangle size={20} className="text-yellow-600 mb-2" />,
                  tip: "Cuidado, seus gastos estão próximos da sua renda. Tente reduzir supérfluos."
              };
          case 'critical':
              return { 
                  color: 'bg-red-100 text-red-800', 
                  dot: 'bg-red-500', 
                  text: 'Crítico',
                  icon: <AlertTriangle size={20} className="text-red-600 mb-2" />,
                  tip: "Suas despesas superaram a renda ou o cartão está estourado. Reveja seu orçamento urgente."
              };
          default:
              return { color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500', text: 'Analisando...', icon: null, tip: '' };
      }
  };

  const status = getHealthBadge();

  return (
    <div className="space-y-6">
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
              <h3 className="text-2xl font-bold text-gray-900 mt-1">R$ 4.250,00</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Limite Cartões</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">R$ 8.500,00</h3>
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
              <h3 className="text-2xl font-bold text-green-600 mt-1">R$ 5.800,00</h3>
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
              <h3 className="text-2xl font-bold text-red-600 mt-1">R$ 2.340,00</h3>
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
                <option value="180">Últimos 180 dias</option>
            </select>
          </div>
          <div className="h-72">
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
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
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
                    <h3 className="text-lg font-semibold text-gray-900">Comparação com Mês Anterior</h3>
                    <p className="text-xs text-gray-500">Evolução de despesas acumuladas</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-primary-500"></span> Mês Atual
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-gray-300"></span> Mês Anterior
                    </div>
                </div>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataLine} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="atual" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="anterior" stroke="#d1d5db" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
      </div>
    </div>
  );
};