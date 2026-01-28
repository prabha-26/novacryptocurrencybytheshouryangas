import { GoogleGenAI, Type } from "@google/genai";
import { PortfolioItem, AIAnalysisResult } from '../types';

export const analyzePortfolio = async (portfolio: PortfolioItem[]): Promise<AIAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const portfolioSummary = portfolio.map(item => ({
      asset: item.coinData.name,
      symbol: item.coinData.symbol,
      allocation: item.currentValue.toFixed(2),
      profit_loss: item.profitPercentage.toFixed(2) + '%',
      market_trend_24h: item.coinData.price_change_percentage_24h + '%'
    }));

    const prompt = `
      Act as a senior crypto hedge fund manager. Analyze this portfolio:
      ${JSON.stringify(portfolioSummary)}

      Provide a JSON response with the following structure:
      1. healthScore: 0-100 integer based on profit and stability.
      2. diversificationScore: 0-100 integer.
      3. summary: A 2-sentence executive summary.
      4. marketSentiment: 'BULLISH', 'BEARISH', or 'NEUTRAL' based on the asset trends.
      5. riskHeatmap: Array of objects { asset, riskLevel (LOW/MEDIUM/HIGH/EXTREME), reason }.
      6. rebalanceSuggestions: Array of objects { action (BUY/SELL/HOLD), asset, reason }.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.INTEGER },
            diversificationScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            marketSentiment: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
            riskHeatmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  asset: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'] },
                  reason: { type: Type.STRING }
                }
              }
            },
            rebalanceSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING, enum: ['BUY', 'SELL', 'HOLD'] },
                  asset: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);

    return {
      ...result,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback data
    return {
      summary: "AI Service temporarily unavailable. Please try again.",
      healthScore: 50,
      diversificationScore: 50,
      riskHeatmap: [],
      rebalanceSuggestions: [],
      marketSentiment: 'NEUTRAL',
      timestamp: Date.now()
    };
  }
};