
import React, { useState, useEffect } from 'react';
// Added useNavigate import to resolve the missing 'navigate' name error.
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
    RefreshCw, Sparkles, Lightbulb, ChevronRight, BrainCircuit, 
    TrendingUp, ShieldCheck, Target, Zap, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PlanType } from '../types';
import { 
    calculateDashboardMetrics, 
    FinancialMetrics 
} from '../services/financialCalculations';
import { generateFinancialInsights, FinancialInsights } from '../services/gemini/insights';
import { DashboardCards } from '../components/dashboard/DashboardCards';
import { FinancialHealth } from '../components/dashboard/FinancialHealth';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  // Initialized the navigate function using the useNavigate hook.
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [aiInsights, setAiInsights] = useState<FinancialInsights | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const isPremium = user?.plan === PlanType.PREMIUM;

  const loadBaseMetrics = async () => {
    if (!user?.id) return;
    try {
        const m = await calculateDashboardMetrics(user.id);
        setMetrics(m);
        // Only auto-trigger AI for Premium users
        if (isPremium && m && !aiInsights) {
            handleAiInsights(m);
        }
    } catch (err) {
        console.error("Dashboard Metrics Error:", err);
    }
  };

  const handleAiInsights = async (m: FinancialMetrics) => {
    if (loadingAi) return;
    setLoadingAi(true);
    try {
        const insights = await generateFinancialInsights({
            name: user?.first_name || 'Usuário',
            plan: user?.plan || 'free',
            monthlyIncome: m.monthlyIncome,
            monthlyExpenses: m.monthlyExpenses,
            totalBalance: m.totalBalance,
            totalCreditLimit: m.totalCreditLimit,
            savingsRate: m.savingsRate,
            creditUtilization: m.creditUtilization,
            topCategories: [], 
            goals: []
        });
        setAiInsights(insights);
    } catch (e) {
        console.error("AI Insight Error:", e);
    } finally {
        setLoadingAi(false);
    }
  };

  useEffect(() => {
    loadBaseMetrics();
  }, [user?.id]);

  return (
    <div className="space-y-8 animate-fade-in-up max-w-7xl mx-auto pb-20">
      {/* Header com Saudação Dinâmica */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel de Controle</h1>
             {isPremium && (
                 <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-200">Pro</span>
             )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Bom ver você de novo, {user?.first_name}!</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" onClick={loadBaseMetrics} className="h-11 glass border-gray-200 shadow-sm">
              <RefreshCw size={16} className="mr-2" /> Sincronizar
           </Button>
           {isPremium && (
                <Button size="sm" onClick={() => metrics && handleAiInsights(metrics)} loading={loadingAi} className="h-11 bg-primary-600 shadow-lg shadow-primary-500/20">
                    <Sparkles size={16} className="mr-2" /> Advisor IA
                </Button>
           )}
        </div>
      </div>

      {/* Main Stats Row */}
      <DashboardCards />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Health & Charts (Col 8) */}
        <div className="lg:col-span-8 space-y-8">
          <FinancialHealth />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                    <TrendingUp size={80} />
                </div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Investimentos</h4>
                <div className="space-y-4">
                    <p className="text-gray-500 text-sm">Acompanhe seu rendimento passivo e evolução de carteira.</p>
                    <div className="pt-2">
                        <span className="text-2xl font-black text-gray-900">R$ 0,00</span>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button className="text-primary-600 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
                        Configurar Carteira <ArrowUpRight size={14} />
                    </button>
                </div>
            </Card>

            <Card className="p-8 hover:shadow-md transition-all group overflow-hidden relative border-dashed bg-gray-50/50">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Zap size={80} />
                </div>
                <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-gray-300">
                        <BrainCircuit size={24} />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Gráficos Avançados</p>
                    <p className="text-xs text-gray-400 mt-2">Disponível em breve para usuários Pro.</p>
                </div>
            </Card>
          </div>
        </div>

        {/* Right Column: AI Advisor (Col 4) */}
        <div className="lg:col-span-4 flex flex-col h-full">
          {isPremium ? (
             <Card className="bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white border-none shadow-2xl h-full p-0 overflow-hidden group flex flex-col">
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                              <Sparkles size={24} className="text-amber-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight tracking-tight">Consultoria Pro</h3>
                            <p className="text-[10px] text-primary-300 uppercase tracking-widest font-black">Powered by Gemini 3</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => metrics && handleAiInsights(metrics)} 
                        disabled={loadingAi}
                        className="p-2.5 bg-white/5 hover:bg-white/15 rounded-xl transition-all border border-white/10"
                        title="Nova Análise"
                      >
                          <RefreshCw size={18} className={`${loadingAi ? "animate-spin" : ""} text-white/60`} />
                      </button>
                  </div>

                  {loadingAi ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                            <Sparkles className="absolute inset-0 m-auto text-primary-400 animate-pulse" size={24} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-primary-100 font-bold tracking-wide">Processando Padrões</p>
                            <p className="text-[10px] text-white/40 uppercase mt-1">Analisando fluxo de caixa...</p>
                          </div>
                      </div>
                  ) : aiInsights ? (
                      <div className="space-y-8 flex-1 flex flex-col">
                          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm shadow-inner">
                            <p className="text-white leading-relaxed text-sm font-medium italic opacity-90">
                                "{aiInsights.summary}"
                            </p>
                          </div>
                          
                          <div className="space-y-5">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em]">Insights Estratégicos</h4>
                                <span className="text-[10px] font-bold text-white/30">Health Score: {aiInsights.financialScore}/100</span>
                              </div>
                              <ul className="space-y-4">
                                  {aiInsights.insights.map((item, i) => (
                                      <li key={i} className="text-xs flex items-start gap-4 text-white/80 leading-relaxed">
                                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>
                                          {item}
                                      </li>
                                  ))}
                              </ul>
                          </div>

                          <div className="mt-auto pt-8 border-t border-white/10">
                              <div className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3">
                                  <Lightbulb size={12} />
                                  Action Plan
                              </div>
                              <div className="space-y-3">
                                  {aiInsights.recommendations.map((rec, i) => (
                                      <div key={i} className="bg-white/5 px-4 py-3 rounded-xl border border-white/5 text-[11px] font-bold flex items-center justify-between group/rec hover:bg-white/10 transition-colors">
                                          <span className="text-white/90">{rec}</span>
                                          <ChevronRight size={14} className="text-white/20 group-hover/rec:text-amber-400 transition-colors" />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                             <Zap size={32} className="text-amber-400 opacity-40" />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2">Pronto para a análise?</h4>
                          <p className="text-xs text-white/50 mb-8 leading-relaxed">Clique no botão abaixo para gerar uma análise profunda da sua saúde financeira atual.</p>
                          <Button onClick={() => metrics && handleAiInsights(metrics)} variant="secondary" className="w-full bg-white text-black border-none hover:bg-gray-100 font-black py-4">
                            Gerar Relatório IA
                          </Button>
                      </div>
                  )}
                </div>
                
                {aiInsights && (
                    <div className="px-8 py-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                            <ShieldCheck size={12} className="text-emerald-500" /> Criptografia Ponta a Ponta
                        </div>
                        <span className="text-[9px] text-white/20">{new Date(aiInsights.generatedAt).toLocaleTimeString()}</span>
                    </div>
                )}
             </Card>
          ) : (
             <Card className="bg-white border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center text-center p-12 rounded-[2.5rem]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-gray-50/50">
                    <Sparkles size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Advisor IA Financeiro</h3>
                <p className="text-sm text-gray-500 mb-10 max-w-[240px] leading-relaxed">Tenha um analista financeiro particular baseado no <span className="text-primary-600 font-bold">Gemini 3</span> cuidando do seu dinheiro 24h por dia.</p>
                <Button className="w-full bg-primary-600 py-4 text-sm font-black shadow-xl shadow-primary-500/20" onClick={() => navigate('/plans')}>Assinar Premium Agora</Button>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
};
