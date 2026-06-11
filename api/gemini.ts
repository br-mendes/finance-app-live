// Endpoint serverless (Vercel) para as chamadas Gemini. A chave de API fica
// apenas no servidor; o browser envia os dados e recebe o JSON estruturado.

import { GoogleGenAI, Type } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

/** Gera diagnóstico financeiro estruturado usando o modelo Gemini via Google GenAI SDK. */
const generateInsights = async (userData: any) => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = `Analise o perfil financeiro de ${userData.name} (Plano: ${userData.plan}).
  Dados do Mês: Renda R$ ${userData.monthlyIncome}, Gastos R$ ${userData.monthlyExpenses}, Saldo R$ ${userData.totalBalance}.
  Saúde: Poupança ${Number(userData.savingsRate).toFixed(1)}%, Uso de Crédito ${Number(userData.creditUtilization).toFixed(1)}%.
  Categorias principais: ${(userData.topCategories || []).map((c: any) => `${c.category} (${c.percentage}%)`).join(', ')}.
  Metas Ativas: ${(userData.goals || []).length}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: "Você é o 'Advisor IA' de elite do FinanceApp. Sua missão é fornecer consultoria técnica, estratégica e motivadora. Analise os dados e retorne um diagnóstico preciso em JSON.",
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: 'Resumo executivo da saúde financeira.' },
          insights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 observações profundas sobre padrões de gastos ou oportunidades.'
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Ações imediatas para otimização de capital.'
          },
          personalizedTip: { type: Type.STRING, description: 'Uma dica bônus curta e impactante.' },
          financialScore: { type: Type.NUMBER, description: 'Pontuação de 0 a 100 baseada na saúde financeira.' }
        },
        required: ['summary', 'insights', 'recommendations', 'personalizedTip', 'financialScore']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/** Realiza análise de mercado em tempo real usando Google Search Grounding via Gemini. */
const analyzeMarket = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analise as notícias e tendências mais recentes do mercado financeiro focando em: ${query}. Destaque Selic, inflação e câmbio.`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: 'Você é um Analista Macro Sênior. Use informações reais e atualizadas da web. Retorne exclusivamente JSON estruturado.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          marketSummary: { type: Type.STRING },
          implications: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionRecommendation: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ['marketSummary', 'implications', 'actionRecommendation', 'confidence']
      }
    }
  });

  const data = JSON.parse(response.text || '{}');

  // Extração de fontes do Google Search Grounding
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri })) || [];

  return { ...data, sources };
};

/** Endpoint Vercel: expõe as ações `insights` e `market-analysis` do Gemini. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Gemini não configurado no servidor (defina GEMINI_API_KEY)' });
  }

  try {
    const { action } = req.body || {};

    switch (action) {
      case 'insights': {
        if (!req.body.userData) return res.status(400).json({ error: 'userData obrigatório' });
        return res.status(200).json(await generateInsights(req.body.userData));
      }
      case 'market-analysis': {
        if (!req.body.query) return res.status(400).json({ error: 'query obrigatória' });
        return res.status(200).json(await analyzeMarket(req.body.query));
      }
      default:
        return res.status(400).json({ error: 'Ação inválida' });
    }
  } catch (error: any) {
    console.error('[API Gemini Error]', error.message);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
