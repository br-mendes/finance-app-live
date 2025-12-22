
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
    RefreshCw, Sparkles, TrendingUp, BrainCircuit, 
    Zap, ArrowRightCircle, Star, Radio, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePersistentData } from '../hooks/usePersistentData';
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
  const navigate = useNavigate();
  const { loadUserData, setupRealtimeSubscriptions } = usePersistentData();
  
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [aiInsights, setAiInsights] = useState<FinancialInsights | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const isPremium = user?.plan === PlanType.PREMIUM;

  const loadBaseMetrics = useCallback(async () => {
    if (!user?.id) return;
    try {
        const m = await calculateDashboardMetrics(user.id);
        setMetrics(m);
    } catch (err) {
        console.error("Dashboard Sync Error:", err);
    }
  }, [user?.id]);

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
    } finally {
        setLoadingAi(false);
    }
  };

  useEffect(() => {
    loadBaseMetrics();

    // Setup real-time updates for the entire dashboard state
    const cleanup = setupRealtimeSubscriptions(() => {
      setIsLive(true);
      loadBaseMetrics();
      // Reset live indicator after sync
      setTimeout(() => setIsLive(false), 2500);
    });

    return () => cleanup && cleanup();
  }, [loadBaseMetrics, setupRealtimeSubscriptions]);

  return (
    <div className="space-y-8 animate-fade-in-up max-w-7xl mx-auto pb-24">
      {/* Header Premium Experience */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Resumo Geral</h1>
             {isPremium && (
                 <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase shadow-xl shadow-amber-500/10 tracking-widest border border-amber-400/30">
                    <Star size={12} fill="currentColor" /> Pro Account
                 </div>
             )}
             {isLive && (
                 <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase border border-emerald-100 animate-pulse">
                    <Radio size={12} /> Live Sync
                 </div>
             )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Controle em tempo real para <span className="text-gray-900 dark:text-gray-300 font-bold">{user?.first_name} {user?.last_name}</span>.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
              <ShieldCheck size={16} className="text-primary-500" />
              <span className="text-[10px] font-black uppercase text-gray-400">Ambiente Seguro</span>
           </div>
           <Button variant="outline" size="sm" onClick={loadBaseMetrics} className="h-12 glass shadow-sm px-6">
              <RefreshCw size={18} className={`mr-2 ${isLive ? 'animate-spin' : ''}`} /> Sincronizar
           </Button>
           {isPremium && (
                <Button size="sm" onClick={() => metrics && handleAiInsights(metrics)} loading={loadingAi} className="h-12 bg-gray-900 dark:bg-primary-600 hover:bg-black dark:hover:bg-primary-700 shadow-2xl px-8">
                    <Sparkles size={18} className="mr-2 text-amber-400" /> Consultar IA
                </Button>
           )}
        </div>
      </div>

      <DashboardCards />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <FinancialHealth />
          
          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="group p-8 relative overflow-hidden bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-2xl transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500"></div>
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Patrimônio Investido</h4>
                    <TrendingUp className="text-emerald-500" size={24} />
                </div>
                <div className="space-y-1 mb-10">
                    <span className="text-4xl font-black text-gray-900 dark:text-white leading-none">R$ 0,00</span>
                    <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 mt-2">
                        <Zap size={14} fill="currentColor" /> Carteira diversificada
                    </p>
                </div>
                <button className="w-full py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:bg-primary-600 hover:text-white transition-all">
                    Otimizar Investimentos
                </button>
            </Card>

            <Card className="p-8 relative border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col items-center justify-center text-center group hover:border-primary-500/50 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-3xl shadow-xl flex items-center justify-center mb-6 text-gray-300 group-hover:text-primary-500 transition-colors group-hover:rotate-6">
                    <BrainCircuit size={32} />
                </div>
                <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">Relatórios Pessoais</h4>
                <p className="text-xs text-gray-400 max-w-[220px]">Insights detalhados baseados em seu histórico real de gastos.</p>
            </Card>
          </div>
        </div>

        {/* Advisor IA Panel */}
        <div className="lg:col-span-4">
          {isPremium ? (
             <Card className="bg-[#0f172a] text-white border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] h-full p-0 overflow-hidden group flex flex-col min-h-[550px]">
                <div className="p-10 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="w-16 h-16 bg-primary-500/20 rounded-3xl flex items-center justify-center border border-primary-500/40 backdrop-blur-sm">
                                <Sparkles size={28} className="text-primary-400 animate-pulse" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#0f172a]"></div>
                          </div>
                          <div>
                            <h3 className="font-black text-2xl tracking-tighter leading-none">Advisor IA</h3>
                            <p className="text-[10px] text-primary-400 uppercase tracking-[0.2em] font-black mt-2">Neural Diagnostic</p>
                          </div>
                      </div>
                  </div>

                  {loadingAi ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-10">
                          <div className="relative">
                            <div className="w-24 h-24 border-[8px] border-primary-500/10 border-t-primary-500 rounded-full animate-spin"></div>
                            <Zap className="absolute inset-0 m-auto text-amber-400 animate-pulse" size={32} />
                          </div>
                          <div className="text-center space-y-3">
                            <p className="text-xl font-black tracking-tight">Analisando sua carteira...</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Processando via Gemini 3 Pro</p>
                          </div>
                      </div>
                  ) : aiInsights ? (
                      <div className="space-y-8 flex-1 flex flex-col animate-fade-in-up">
                          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl relative">
                            <p className="text-white/90 leading-relaxed text-base font-medium italic">
                                "{aiInsights.summary}"
                            </p>
                          </div>
                          <div className="space-y-6 flex-1">
                              {aiInsights.insights.map((item, i) => (
                                  <div key={i} className="text-sm flex items-start gap-5 text-white/60 leading-relaxed group/item hover:text-white transition-colors">
                                      <div className="mt-2 w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0 group-hover/item:scale-125 transition-transform"></div>
                                      <span>{item}</span>
                                  </div>
                              ))}
                          </div>
                          <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white hover:text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                            Exportar Diagnóstico
                          </Button>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 px-4">
                          <div className="p-8 bg-white/5 rounded-full">
                            <BrainCircuit size={64} className="text-primary-500 opacity-20" />
                          </div>
                          <p className="text-sm text-white/40 max-w-[200px] font-medium leading-relaxed">Clique abaixo para uma análise profunda de sua saúde financeira.</p>
                          <Button onClick={() => metrics && handleAiInsights(metrics)} variant="secondary" className="w-full bg-white text-black font-black py-6 rounded-3xl shadow-3xl hover:scale-[1.02] transition-all">
                            Gerar Relatório Estratégico
                          </Button>
                      </div>
                  )}
                </div>
             </Card>
          ) : (
             <Card className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-100 dark:border-white/10 h-full flex flex-col items-center justify-center text-center p-16 rounded-[3rem]">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter">Advisor IA 🔒</h3>
                <p className="text-sm text-gray-400 mb-10 max-w-[240px]">Insights neurais sobre seus gastos estão disponíveis apenas para usuários Pro.</p>
                <Button className="w-full bg-primary-600 shadow-xl shadow-primary-500/20 py-4" onClick={() => navigate('/plans')}>Desbloquear Premium</Button>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
};
