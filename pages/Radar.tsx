
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, PlanType } from '../types';
import { 
    RefreshCw, ExternalLink, Calendar, Crown, 
    AlertTriangle, Globe, Sparkles, ChevronRight, Target,
    Newspaper, Info
} from 'lucide-react';
import { analyzeMarketNews, MarketAnalysis } from '../services/gemini/insights';

interface RadarProps {
    user: User;
}

export const Radar: React.FC<RadarProps> = ({ user }) => {
    const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isPremium = user.plan === PlanType.PREMIUM;

    useEffect(() => {
        if (isPremium) {
            const cached = localStorage.getItem('financeapp_radar_analysis');
            const cachedTime = localStorage.getItem('financeapp_radar_time');
            if (cached && cachedTime) {
                setAnalysis(JSON.parse(cached));
                setLastUpdated(cachedTime);
            } else {
                fetchMarketData();
            }
        }
    }, [isPremium]);

    const fetchMarketData = async () => {
        if (!isPremium) return;
        setLoading(true);
        setError(null);

        try {
            const result = await analyzeMarketNews("Últimas notícias mercado financeiro brasileiro hoje, Selic, IPCA e Ibovespa");
            setAnalysis(result);
            const now = new Date().toLocaleString('pt-BR');
            setLastUpdated(now);
            
            localStorage.setItem('financeapp_radar_analysis', JSON.stringify(result));
            localStorage.setItem('financeapp_radar_time', now);
        } catch (err: any) {
            console.error("Market Data Error:", err);
            setError("Não foi possível conectar com o servidor de notícias em tempo real.");
        } finally {
            setLoading(false);
        }
    };

    if (!isPremium) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-8 bg-white rounded-[3rem] shadow-sm border border-gray-100 max-w-4xl mx-auto">
                 <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-pulse-scale border-8 border-white">
                    <Crown size={48} className="text-white" />
                 </div>
                 <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Radar do Mercado PRO</h1>
                 <p className="text-gray-500 max-w-sm mb-12 font-medium leading-relaxed">
                    Antecipe-se aos fatos do mercado com insights reais gerados por IA baseados em fontes verificadas em tempo real.
                 </p>
                 <Button size="lg" className="px-12 py-5 bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-200 transition-all font-black text-lg h-auto">
                    <Sparkles size={20} className="mr-2" /> 
                    Desbloquear Radar IA
                 </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header Radar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Newspaper size={160} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Radar do Mercado</h1>
                        <span className="bg-primary-50 text-primary-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-primary-100">Live Grounding</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Curadoria inteligente do cenário econômico global e nacional.</p>
                </div>
                <div className="flex flex-col md:items-end gap-3 relative z-10">
                    {lastUpdated && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">Sincronizado: {lastUpdated}</span>}
                    <Button onClick={fetchMarketData} disabled={loading} className="w-full md:w-auto h-12 shadow-lg shadow-primary-500/10 font-bold px-8">
                        {loading ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <RefreshCw size={18} className="mr-2" />}
                        {loading ? 'Sincronizando...' : 'Atualizar Agora'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 flex items-center gap-4 font-bold animate-fade-in-up">
                    <AlertTriangle size={24} className="shrink-0" />
                    {error}
                </div>
            )}

            {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                    {/* Main Summary */}
                    <Card className="lg:col-span-8 p-10 space-y-8 rounded-[2.5rem]">
                        <div className="flex items-center gap-4 text-primary-600">
                            <div className="p-3 bg-primary-50 rounded-2xl border border-primary-100 shadow-sm">
                                <Sparkles size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sumário do Advisor</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg font-medium italic border-l-4 border-primary-500 pl-6 py-2">
                            {analysis.marketSummary}
                        </p>
                        
                        <div className="pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <Info size={18} className="text-gray-400" />
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Implicações Chave</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {analysis.implications.map((imp, i) => (
                                    <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                            <ChevronRight size={16} className="text-primary-500" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 leading-relaxed">{imp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Sidebar Analysis */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Recommendation Card */}
                        <Card className="p-10 bg-gradient-to-br from-primary-900 to-primary-700 text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                            <h2 className="text-lg font-black mb-6 flex items-center gap-3">
                                <Target size={24} className="text-amber-400" />
                                Recomendação
                            </h2>
                            <p className="text-primary-50 leading-relaxed font-medium text-sm mb-10">
                                {analysis.actionRecommendation}
                            </p>
                            <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <span className="text-[10px] font-black text-primary-300 uppercase tracking-widest block mb-1">Índice de Confiança</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-4xl font-black">{analysis.confidence}%</span>
                                        <div className={`w-3 h-3 rounded-full ${analysis.confidence > 80 ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Sources Card - Mandatory Listing */}
                        {analysis.sources && analysis.sources.length > 0 && (
                            <Card className="p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-6">
                                    <Globe size={18} className="text-gray-400" />
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Fontes Verificadas</h3>
                                </div>
                                <div className="space-y-4">
                                    {analysis.sources.map((src, i) => (
                                        <a 
                                            key={i} 
                                            href={src.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block p-4 rounded-2xl bg-gray-50 hover:bg-primary-50 border border-gray-100 hover:border-primary-200 transition-all group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-700 truncate pr-4 group-hover:text-primary-700 uppercase tracking-wider">
                                                    {src.title}
                                                </span>
                                                <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-500 shrink-0" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                                <p className="mt-6 text-[10px] text-gray-400 italic text-center">
                                    Dados fundamentados via Google Search Grounding.
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            )}
            
            {loading && !analysis && (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                     <RefreshCw className="text-primary-300 animate-spin" size={48} />
                     <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Lendo tendências globais...</p>
                </div>
            )}
        </div>
    );
};
