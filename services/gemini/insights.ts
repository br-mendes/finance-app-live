
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
 * Gera insights financeiros personalizados utilizando JSON Schema rígido e Gemini 3.
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Analise os dados financeiros de ${userData.name} (Plano: ${userData.plan}).
    Dados: Renda R$ ${userData.monthlyIncome}, Gastos R$ ${userData.monthlyExpenses}, Saldo R$ ${userData.totalBalance}.
    Taxa de Poupança: ${userData.savingsRate.toFixed(1)}%, Uso de Crédito: ${userData.creditUtilization.toFixed(1)}%.
    Top Categorias: ${userData.topCategories.map(c => `${c.category} (${c.percentage}%)`).join(', ')}.
    Metas Ativas: ${userData.goals.length}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é o 'Advisor IA' do FinanceApp. Sua missão é fornecer consultoria financeira de alto nível, técnica mas encorajadora. Retorne sempre um JSON válido e estruturado.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumo executivo da saúde financeira." },
            insights: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3 observações profundas sobre padrões de gastos."
            },
            recommendations: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Ações práticas e imediatas para melhorar o patrimônio."
            },
            personalizedTip: { type: Type.STRING, description: "Uma dica bônus curta e motivacional." },
            financialScore: { type: Type.NUMBER, description: "Pontuação de 0 a 100 baseada nos dados fornecidos." }
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
    console.error('Gemini Insights Critical Error:', error);
    return getFallbackInsights();
  }
};

/**
 * Analisa notícias do mercado com Search Grounding em tempo real.
 */
export const analyzeMarketNews = async (query: string): Promise<MarketAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Forneça uma análise atualizada sobre o mercado financeiro focando em: ${query}.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Você é um analista de mercado sênior. Use informações reais da web para fundamentar sua análise. Retorne JSON estruturado.",
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
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri })) || [];

    return { ...data, sources };
  } catch (error) {
    console.error('Market analysis grounding error:', error);
    return {
      marketSummary: "Instabilidade na conexão com os dados de mercado. Mantenha cautela em suas operações.",
      implications: ["Dados de mercado podem estar defasados."],
      actionRecommendation: "Aguarde a normalização dos sistemas para decisões críticas.",
      confidence: 50
    };
  }
};

const getFallbackInsights = (): FinancialInsights => ({
  summary: "Análise em modo de segurança ativado. Continue registrando suas transações.",
  insights: [
    "Acompanhar gastos diários é o primeiro passo para o sucesso.",
    "Categorizar despesas ajuda a identificar desperdícios.",
    "O equilíbrio entre renda e gastos é fundamental."
  ],
  recommendations: ["Revise seus gastos fixos", "Tente poupar 10% da renda"],
  personalizedTip: "Consistência vence a intensidade no longo prazo! 🎯",
  financialScore: 70,
  generatedAt: new Date()
});
