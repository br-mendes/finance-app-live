
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
    RefreshCw, Sparkles, TrendingUp, BrainCircuit, 
    Target, Zap, ArrowRightCircle, Star, Radio
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
        console.error("Metrics Loading Error:", err);
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

    // Setup real-time updates
    const cleanup = setupRealtimeSubscriptions(() => {
      setIsLive(true);
      loadBaseMetrics();
      setTimeout(() => setIsLive(false), 2000);
    });

    return () => cleanup && cleanup();
  }, [loadBaseMetrics, setupRealtimeSubscriptions]);

  return (
    <div className="space-y-8 animate-fade-in-up max-w-7xl mx-auto pb-24">
      {/* Header Premium com Saudação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Overview</h1>
             {isPremium && (
                 <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase shadow-lg shadow-amber-500/20 tracking-widest border border-amber-400/50">
                    <Star size={10} fill="currentColor" /> Pro
                 </div>
             )}
             {isLive && (
                 <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-100 animate-pulse">
                    <Radio size={10} /> Live
                 </div>
             )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Seja bem-vindo, <span className="text-gray-900 dark:text-gray-300 font-bold">{user?.first_name}</span>.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" onClick={loadBaseMetrics} className="h-11 glass border-gray-200 dark:border-white/10 shadow-sm px-6">
              <RefreshCw size={16} className={`mr-2 ${loadingAi ? 'animate-spin' : ''}`} /> Sincronizar
           </Button>
           {isPremium && (
                <Button size="sm" onClick={() => metrics && handleAiInsights(metrics)} loading={loadingAi} className="h-11 bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/25 px-6">
                    <Sparkles size={16} className="mr-2" /> Consultar IA
                </Button>
           )}
        </div>
      </div>

      {/* Cards de Status Rápido */}
      <DashboardCards />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <FinancialHealth />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="group p-8 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary-500/5 dark:bg-gray-900/40 border-none shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Investimentos</h4>
                    <TrendingUp className="text-primary-500" size={20} />
                </div>
                <div className="space-y-1 mb-8">
                    <span className="text-4xl font-black text-gray-900 dark:text-white leading-none">R$ 0,00</span>
                    <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <ArrowRightCircle size={12} /> Carteira em dia
                    </p>
                </div>
                <button className="w-full py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:bg-primary-50 transition-all">
                    Explorar Oportunidades
                </button>
            </Card>

            <Card className="p-8 relative border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col items-center justify-center text-center group hover:border-primary-500/50 transition-colors">
                <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex items-center justify-center mb-5 text-gray-300 group-hover:text-primary-500 transition-colors">
                    <BrainCircuit size={28} />
                </div>
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Estatísticas Reais</p>
                <p className="text-xs text-gray-400 max-w-[180px]">Disponível para contas Pro no próximo ciclo.</p>
            </Card>
          </div>
        </div>

        {/* Advisor IA */}
        <div className="lg:col-span-4">
          {isPremium ? (
             <Card className="bg-[#0b0e14] text-white border-none shadow-3xl h-full p-0 overflow-hidden group flex flex-col min-h-[500px]">
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-primary-600/20 rounded-[1.25rem] flex items-center justify-center border border-primary-500/30">
                                <Sparkles size={24} className="text-primary-400" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0b0e14]"></div>
                          </div>
                          <div>
                            <h3 className="font-black text-xl tracking-tighter leading-none">Advisor IA</h3>
                            <p className="text-[9px] text-primary-400 uppercase tracking-[0.2em] font-black mt-1">Intelligence Layer</p>
                          </div>
                      </div>
                  </div>

                  {loadingAi ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                          <div className="relative">
                            <div className="w-20 h-20 border-[6px] border-primary-500/10 border-t-primary-500 rounded-full animate-spin"></div>
                            <Zap className="absolute inset-0 m-auto text-amber-400 animate-pulse" size={28} />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-lg font-black tracking-tight">Analisando dados...</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Consultando Gemini 3 Pro...</p>
                          </div>
                      </div>
                  ) : aiInsights ? (
                      <div className="space-y-8 flex-1 flex flex-col animate-fade-in-up">
                          <div className="bg-primary-600/10 p-6 rounded-[2rem] border border-primary-500/20 backdrop-blur-md relative">
                            <p className="text-white/90 leading-relaxed text-sm font-medium italic">
                                "{aiInsights.summary}"
                            </p>
                          </div>
                          <div className="space-y-5">
                              {aiInsights.insights.map((item, i) => (
                                  <div key={i} className="text-xs flex items-start gap-4 text-white/70 leading-relaxed">
                                      <div className="mt-1 w-2 h-2 rounded-full bg-primary-500 shrink-0"></div>
                                      <span>{item}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 px-4">
                          <Button onClick={() => metrics && handleAiInsights(metrics)} variant="secondary" className="w-full bg-white text-black font-black py-6 rounded-[1.5rem] shadow-2xl">
                            Gerar Relatório Estratégico
                          </Button>
                      </div>
                  )}
                </div>
             </Card>
          ) : (
             <Card className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-100 dark:border-white/10 h-full flex flex-col items-center justify-center text-center p-12 rounded-[3rem]">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Advisor IA</h3>
                <Button className="w-full bg-primary-600" onClick={() => navigate('/plans')}>Desbloquear Premium</Button>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
};
