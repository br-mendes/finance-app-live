import { GoogleGenAI, Type } from "@google/genai";

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

/**
 * Gera insights financeiros premium utilizando o modelo Gemini 3 Pro.
 * Implementa validação rígida de schema para garantir respostas JSON consistentes.
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
    // Inicialização mandatória a cada chamada para capturar a chave de API mais recente do ambiente
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

    const prompt = `Analise o perfil financeiro de ${userData.name} (Plano: ${userData.plan}).
    Dados do Mês: Renda R$ ${userData.monthlyIncome}, Gastos R$ ${userData.monthlyExpenses}, Saldo R$ ${userData.totalBalance}.
    Saúde: Poupança ${userData.savingsRate.toFixed(1)}%, Uso de Crédito ${userData.creditUtilization.toFixed(1)}%.
    Categorias principais: ${userData.topCategories.map(c => `${c.category} (${c.percentage}%)`).join(', ')}.
    Metas Ativas: ${userData.goals.length}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é o 'Advisor IA' de elite do FinanceApp. Sua missão é fornecer consultoria técnica, estratégica e motivadora. Analise os dados e retorne um diagnóstico preciso em JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumo executivo da saúde financeira." },
            insights: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 observações profundas sobre padrões de gastos ou oportunidades." 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Ações imediatas para otimização de capital." 
            },
            personalizedTip: { type: Type.STRING, description: "Uma dica bônus curta e impactante." },
            financialScore: { type: Type.NUMBER, description: "Pontuação de 0 a 100 baseada na saúde financeira." }
          },
          required: ["summary", "insights", "recommendations", "personalizedTip", "financialScore"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
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
 * Realiza análise de mercado em tempo real utilizando Google Search Grounding.
 */
export const analyzeMarketNews = async (query: string): Promise<MarketAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analise as notícias e tendências mais recentes do mercado financeiro focando em: ${query}. Destaque Selic, inflação e câmbio.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Você é um Analista Macro Sênior. Use informações reais e atualizadas da web. Retorne exclusivamente JSON estruturado.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketSummary: { type: Type.STRING },
            implications: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionRecommendation: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["marketSummary", "implications", "actionRecommendation", "confidence"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    // Extração obrigatória de fontes para Grounding
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri })) || [];

    return { ...data, sources };
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
