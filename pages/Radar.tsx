import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { GoogleGenAI } from "@google/genai";
import { User, PlanType } from '../types';
import { Lock, RefreshCw, ExternalLink, Calendar, Newspaper, Crown, AlertTriangle, TrendingUp, Globe } from 'lucide-react';

interface RadarProps {
    user: User;
}

interface NewsItem {
    title: string;
    summary: string;
    category: string;
    date: string;
    source: string;
    url?: string;
}

export const Radar: React.FC<RadarProps> = ({ user }) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

    const isPremium = user.plan === PlanType.PREMIUM;

    useEffect(() => {
        if (!isPremium) {
            // If user lands here directly (e.g. via URL), show lock
            setIsPremiumModalOpen(true);
        } else {
            const cached = localStorage.getItem('financeapp_radar_news');
            const cachedTime = localStorage.getItem('financeapp_radar_time');
            if (cached && cachedTime) {
                setNews(JSON.parse(cached));
                setLastUpdated(cachedTime);
            }
        }
    }, [isPremium]);

    const fetchNews = async () => {
        if (!isPremium) {
            setIsPremiumModalOpen(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // @ts-ignore
            const apiKey = process.env.API_KEY; 
            
            if (!apiKey) {
                throw new Error("API Key não configurada.");
            }

            const ai = new GoogleGenAI({ apiKey });
            
            // Search Prompt
            const prompt = `
            Você é um analista financeiro sênior (Expert Financeiro).
            Realize uma busca no Google Search (grounding) para encontrar as notícias mais importantes do mercado financeiro HOJE e ONTEM.
            
            Foco de busca:
            1. Mercado Brasileiro: Ibovespa, Dólar, Selic, Petrobras, Vale, Bancos, Política Econômica.
            2. Mercado Global: S&P 500, Nasdaq, FED (Juros EUA), China.

            Selecione as 6 notícias mais impactantes.
            
            Retorne APENAS um JSON válido (sem markdown 'json') com o seguinte formato:
            [
              {
                "title": "Título curto e impactante",
                "summary": "Resumo em pt-BR de até 200 caracteres explicando o impacto no bolso do investidor.",
                "category": "Uma tag como: 'Bolsa Brasil', 'Economia Global', 'Câmbio', 'Renda Fixa'",
                "date": "DD/MM",
                "source": "Nome da fonte (ex: InfoMoney, G1, Bloomberg)",
                "url": "URL da notícia encontrada"
              }
            ]
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    responseMimeType: "application/json"
                }
            });

            // Extract text and parse
            const textResponse = response.text || '[]';
            let parsedNews: NewsItem[] = [];
            
            try {
                // Remove Markdown code blocks if present
                const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedNews = JSON.parse(cleanJson);
                
                // If using Grounding, we can try to enrich URLs if the model didn't provide them perfectly in JSON
                // However, for simplicity, we rely on the model filling the "url" field via its tool use.
                
            } catch (e) {
                console.error("JSON Parse Error", e);
                throw new Error("Falha ao processar as notícias da IA.");
            }
            
            if (!Array.isArray(parsedNews) || parsedNews.length === 0) {
                 throw new Error("Nenhuma notícia relevante encontrada.");
            }

            setNews(parsedNews);
            const now = new Date().toLocaleString('pt-BR');
            setLastUpdated(now);
            
            localStorage.setItem('financeapp_radar_news', JSON.stringify(parsedNews));
            localStorage.setItem('financeapp_radar_time', now);

        } catch (err: any) {
            console.error("Erro ao buscar notícias:", err);
            setError("Não foi possível atualizar o Radar. Verifique sua conexão ou tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    if (!isPremium) {
        return (
            <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-6 animate-fade-in-up">
                 <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white">
                    <Crown size={48} className="text-yellow-600" />
                 </div>
                 <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Radar do Mercado <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">Premium</span></h1>
                 <p className="text-gray-500 max-w-md mb-8 text-lg leading-relaxed">
                    Receba resumos diários do mercado financeiro gerados por <strong>Inteligência Artificial</strong>. Antecipe tendências e proteja seu patrimônio.
                 </p>
                 
                 <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <TrendingUp className="text-green-500 mb-2" />
                        <span className="text-sm font-bold text-gray-700">Ações & B3</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <Globe className="text-blue-500 mb-2" />
                        <span className="text-sm font-bold text-gray-700">Mercado Global</span>
                    </div>
                 </div>

                 <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-600 border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    <Crown size={20} className="mr-2" />
                    Desbloquear Radar
                 </Button>

                <Modal
                    isOpen={isPremiumModalOpen}
                    onClose={() => setIsPremiumModalOpen(false)}
                    title="Conteúdo Exclusivo"
                    footer={
                        <Button variant="secondary" onClick={() => setIsPremiumModalOpen(false)} className="w-full">
                            Entendi
                        </Button>
                    }
                >
                    <div className="text-center py-6">
                        <Lock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h3>
                        <p className="text-gray-500">
                            Esta funcionalidade utiliza processamento avançado de IA em tempo real e é exclusiva para assinantes Premium.
                        </p>
                    </div>
                </Modal>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Radar do Mercado
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            IA Powered
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">As principais notícias financeiras selecionadas e resumidas para você.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {lastUpdated && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            Atualizado: {lastUpdated}
                        </span>
                    )}
                    <Button onClick={fetchNews} disabled={loading} className="w-full md:w-auto">
                        {loading ? (
                            <>
                                <RefreshCw size={18} className="mr-2 animate-spin" />
                                Analisando Mercado...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={18} className="mr-2" />
                                Atualizar Notícias
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start animate-fade-in-up">
                    <AlertTriangle className="text-red-500 mr-3 mt-0.5" size={20} />
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Empty State */}
            {!news.length && !loading && !error && (
                 <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Newspaper size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Seu Radar está vazio</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Clique no botão "Atualizar" para que nossa IA busque os acontecimentos mais recentes do mercado financeiro.
                    </p>
                    <Button onClick={fetchNews} variant="outline">Buscar Notícias Agora</Button>
                 </div>
            )}

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item, index) => (
                    <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 group border-t-4 border-t-primary-500">
                        <div className="flex justify-between items-start mb-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 uppercase tracking-wide">
                                {item.category}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded">
                                <Calendar size={12} className="mr-1.5" />
                                {item.date}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-primary-600 transition-colors">
                            {item.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-6 flex-grow leading-relaxed">
                            {item.summary}
                        </p>
                        
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                            <span className="text-xs font-semibold text-gray-500 flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                                {item.source}
                            </span>
                            {item.url ? (
                                <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-800 text-sm font-bold flex items-center transition-colors bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100"
                                >
                                    Ler Mais <ExternalLink size={14} className="ml-1.5" />
                                </a>
                            ) : (
                                <span className="text-gray-300 text-xs italic">Sem link</span>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
            
            {news.length > 0 && (
                <div className="text-center mt-8 pb-8">
                    <p className="text-xs text-gray-400 bg-gray-50 inline-block px-4 py-2 rounded-full">
                        ⚡ Notícias agregadas e resumidas por Inteligência Artificial (Google Gemini). Verifique sempre as fontes oficiais.
                    </p>
                </div>
            )}
        </div>
    );
};