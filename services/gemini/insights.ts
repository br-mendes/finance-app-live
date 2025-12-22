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
 * Gera insights financeiros premium usando o modelo Gemini 3 Pro Preview.
 * Focado em análise de saúde financeira e recomendações estratégicas.
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
    // Inicialização mandatória dentro da função para garantir o uso da chave atualizada
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Analise os dados financeiros de ${userData.name} (${userData.plan}).
    Receita: R$ ${userData.monthlyIncome}, Gastos: R$ ${userData.monthlyExpenses}, Saldo: R$ ${userData.totalBalance}.
    Poupança: ${userData.savingsRate.toFixed(1)}%, Uso de Crédito: ${userData.creditUtilization.toFixed(1)}%.
    Gastos principais: ${userData.topCategories.map(c => `${c.category} (${c.percentage}%)`).join(', ')}.
    Metas: ${userData.goals.map(g => `${g.name} (${g.progress}%)`).join(', ') || 'Nenhuma'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é o Diretor Financeiro (CFO) pessoal do usuário no FinanceApp. Sua linguagem é técnica porém motivadora. Retorne exclusivamente JSON estruturado.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            personalizedTip: { type: Type.STRING },
            financialScore: { type: Type.NUMBER }
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
    console.error('Gemini SDK Error (Insights):', error);
    return getFallbackInsights();
  }
};

/**
 * Análise de mercado em tempo real com Google Search Grounding.
 */
export const analyzeMarketNews = async (query: string): Promise<MarketAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro é necessário para ferramentas como Search Grounding
      contents: `Analise o cenário atual do mercado financeiro focando em: ${query}. Dê ênfase a Selic, dólar e inflação no Brasil.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Analista Macroeconômico Sênior. Forneça análises baseadas em fatos reais e recentes. Retorne JSON estruturado.",
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
    
    // Extração mandatória de URLs para Search Grounding
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri })) || [];

    return { ...data, sources };
  } catch (error) {
    console.error('Gemini SDK Error (Market Analysis):', error);
    return {
      marketSummary: "Mercado em volatilidade moderada. Fontes de dados temporariamente limitadas.",
      implications: ["Renda fixa permanece atrativa", "Cuidado com exposição cambial direta"],
      actionRecommendation: "Mantenha diversificação em ativos de baixo risco.",
      confidence: 65
    };
  }
};

const getFallbackInsights = (): FinancialInsights => ({
  summary: "Estamos processando seus dados para uma análise completa.",
  insights: [
    "Mantenha o registro de todas as suas despesas fixas.",
    "Acompanhe suas metas semanalmente.",
    "Categorize seus gastos para identificar economias."
  ],
  recommendations: ["Revise seus planos de assinatura", "Aumente sua reserva de emergência"],
  personalizedTip: "O segredo da riqueza é a consistência. 🚀",
  financialScore: 75,
  generatedAt: new Date()
});
