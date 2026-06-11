// As chamadas Gemini rodam no endpoint serverless /api/gemini — a chave de
// API vive apenas no servidor. Este módulo mantém as interfaces e os
// fallbacks usados pelas páginas.

export interface FinancialInsights {
  summary: string;
  insights: string[];
  recommendations: string[];
  personalizedTip: string;
  financialScore: number;
  generatedAt: Date;
}

export interface MarketAnalysis {
  marketSummary: string;
  implications: string[];
  actionRecommendation: string;
  confidence: number;
  sources?: { title: string; uri: string }[];
}

/** Faz POST para `/api/gemini` e lança erro descritivo em respostas não-2xx. */
const callGeminiApi = async (payload: Record<string, any>) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let detail: string;
    try {
      const body = await response.json();
      detail = body.error || JSON.stringify(body);
    } catch {
      detail = await response.text();
    }
    throw new Error(`Gemini API error ${response.status} ${response.statusText}: ${detail}`);
  }

  return await response.json();
};

/**
 * Gera insights financeiros premium utilizando o modelo Gemini 3 Pro
 * (via endpoint server-side).
 */
export const generateFinancialInsights = async (
  userData: {
    name: string;
    plan: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalBalance: number;
    totalCreditLimit: number;
    savingsRate: number;
    creditUtilization: number;
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
    goals: Array<{ name: string; progress: number; deadline?: string }>;
  }
): Promise<FinancialInsights> => {
  try {
    const result = await callGeminiApi({ action: 'insights', userData });
    return {
      ...result,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Gemini Insights Service Error:', error);
    return getFallbackInsights();
  }
};

/**
 * Realiza análise de mercado em tempo real utilizando Google Search Grounding
 * (via endpoint server-side).
 */
export const analyzeMarketNews = async (query: string): Promise<MarketAnalysis> => {
  try {
    return await callGeminiApi({ action: 'market-analysis', query });
  } catch (error) {
    console.error('Market analysis grounding error:', error);
    return {
      marketSummary: "Instabilidade na leitura de dados em tempo real. Consulte fontes oficiais do BACEN.",
      implications: ["Risco de volatilidade aumentado devido a falhas na fonte de dados."],
      actionRecommendation: "Mantenha liquidez e aguarde estabilização dos sinais de mercado.",
      confidence: 50
    };
  }
};

/** Retorna insights genéricos de fallback quando a chamada à API Gemini falha. */
const getFallbackInsights = (): FinancialInsights => ({
  summary: "Análise baseada em parâmetros de segurança. Continue registrando suas transações para uma análise mais profunda.",
  insights: [
    "A regularidade nos lançamentos é a base do controle.",
    "Categorizar despesas ajuda a visualizar vazamentos de capital.",
    "O planejamento antecipado reduz a ansiedade financeira."
  ],
  recommendations: ["Revise seus gastos variáveis", "Tente manter uma reserva de 3 meses"],
  personalizedTip: "Paciência e disciplina superam a sorte nos investimentos. 🎯",
  financialScore: 70,
  generatedAt: new Date()
});
