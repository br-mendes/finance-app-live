import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
    RefreshCw, Sparkles, Lightbulb, ChevronRight, BrainCircuit, 
    TrendingUp, ShieldCheck, Target, Zap, ArrowUpRight,
    ArrowRightCircle, Star
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
        if (isPremium && m && !aiInsights) {
            handleAiInsights(m);
        }
    } catch (err) {
        console.error("Metrics Loading Error:", err);
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
    } finally {
        setLoadingAi(false);
    }
  };

  useEffect(() => {
    loadBaseMetrics();
  }, [user?.id]);

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
        {/* Coluna Principal (8/12) */}
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

        {/* Sidebar IA Advisor (4/12) */}
        <div className="lg:col-span-4">
          {isPremium ? (
             <Card className="bg-[#0b0e14] text-white border-none shadow-3xl h-full p-0 overflow-hidden group flex flex-col min-h-[500px]">
                <div className="p-8 flex-1 flex flex-col">
                  {/* Header do Chat/Advisor */}
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
                      <button 
                        onClick={() => metrics && handleAiInsights(metrics)} 
                        disabled={loadingAi}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 shadow-lg"
                      >
                          <RefreshCw size={20} className={`${loadingAi ? "animate-spin" : ""} text-white/50`} />
                      </button>
                  </div>

                  {loadingAi ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                          <div className="relative">
                            <div className="w-20 h-20 border-[6px] border-primary-500/10 border-t-primary-500 rounded-full animate-spin"></div>
                            <Zap className="absolute inset-0 m-auto text-amber-400 animate-pulse" size={28} />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-lg font-black tracking-tight">Sincronizando Dados</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Consultando Gemini 3 Pro...</p>
                          </div>
                      </div>
                  ) : aiInsights ? (
                      <div className="space-y-8 flex-1 flex flex-col animate-fade-in-up">
                          <div className="bg-primary-600/10 p-6 rounded-[2rem] border border-primary-500/20 backdrop-blur-md relative">
                            <div className="absolute top-0 left-6 -translate-y-1/2">
                                <Lightbulb size={24} className="text-amber-400 fill-amber-400/20" />
                            </div>
                            <p className="text-white/90 leading-relaxed text-sm font-medium italic">
                                "{aiInsights.summary}"
                            </p>
                          </div>
                          
                          <div className="space-y-5">
                              <h4 className="text-[9px] font-black uppercase text-primary-400 tracking-[0.3em] border-b border-white/5 pb-3">Insights de Hoje</h4>
                              <ul className="space-y-5">
                                  {aiInsights.insights.map((item, i) => (
                                      <li key={i} className="text-xs flex items-start gap-4 text-white/70 leading-relaxed group/item">
                                          <div className="mt-1 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_12px_rgba(14,165,233,0.6)] group-hover/item:scale-125 transition-transform"></div>
                                          <span className="group-hover/item:text-white transition-colors">{item}</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>

                          <div className="mt-auto pt-8 border-t border-white/5">
                              <h4 className="text-[9px] font-black uppercase text-amber-500 tracking-[0.3em] mb-5">Próximos Passos</h4>
                              <div className="space-y-3">
                                  {aiInsights.recommendations.map((rec, i) => (
                                      <div key={i} className="bg-white/5 px-5 py-4 rounded-2xl border border-white/5 text-[11px] font-bold flex items-center justify-between group/rec hover:bg-white/10 transition-all cursor-pointer">
                                          <span className="text-white/80">{rec}</span>
                                          <ChevronRight size={16} className="text-white/20 group-hover/rec:text-primary-400 group-hover/rec:translate-x-1 transition-all" />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 px-4">
                          <div className="w-20 h-20 bg-primary-600/5 rounded-full flex items-center justify-center border border-primary-500/10">
                             <Target size={40} className="text-primary-500 opacity-40" />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-xl font-black text-white">Pronto para a análise?</h4>
                             <p className="text-sm text-white/40 leading-relaxed">Libere o poder da inteligência artificial para otimizar seus rendimentos hoje.</p>
                          </div>
                          <Button onClick={() => metrics && handleAiInsights(metrics)} variant="secondary" className="w-full bg-white text-black font-black py-6 rounded-[1.5rem] shadow-2xl hover:scale-[1.02] transition-transform">
                            Gerar Relatório Estratégico
                          </Button>
                      </div>
                  )}
                </div>
                
                {aiInsights && (
                    <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                            <ShieldCheck size={14} className="text-emerald-500" /> Secure Analysis
                        </div>
                        <span className="text-[9px] text-white/20 font-black">{new Date(aiInsights.generatedAt).toLocaleTimeString('pt-BR')}</span>
                    </div>
                )}
             </Card>
          ) : (
             <Card className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-100 dark:border-white/10 h-full flex flex-col items-center justify-center text-center p-12 rounded-[3rem] shadow-sm">
                <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-10 relative">
                    <Sparkles size={48} className="text-gray-300" />
                    <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                        <Star size={14} fill="white" className="text-white" />
                    </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-none">Advisor IA</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-12 max-w-[260px] leading-relaxed">Tenha uma análise preditiva e estratégica baseada no <span className="text-primary-600 font-black">Gemini 3 Pro</span>.</p>
                <Button className="w-full bg-primary-600 py-5 text-sm font-black rounded-2xl shadow-2xl shadow-primary-500/30" onClick={() => navigate('/plans')}>Desbloquear Premium</Button>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
};
