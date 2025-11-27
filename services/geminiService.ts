import { GoogleGenAI } from "@google/genai";
import { AppMode, MarketQuote } from "../types";

// 使用指定的 API Key 環境變數
const apiKey = process.env.API_KEY || '';

/**
 * 產生市場分析報告
 * @param symbol 股票代號
 * @param quote 當前報價數據
 * @param mode 應用程式模式
 */
export const generateMarketInsight = async (
  symbol: string,
  quote: MarketQuote,
  mode: AppMode
): Promise<string> => {
  
  // [繁體中文註解] 若無 API Key 或處於模擬模式，回傳預設樣板文字，避免錯誤。
  if (mode === AppMode.MOCK || !apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`[模擬分析模式]
針對 ${symbol} 的市場分析：
1. 技術面：目前價格 ${quote.c} 顯示短期均線支撐強勁，成交量穩定。
2. 消息面：科技類股近期受惠於 AI 浪潮，市場情緒樂觀。
3. 投資建議：建議區間操作，觀察 ${quote.l} 是否有守。
(請設定 API KEY 以啟用 Gemini 真實分析)`);
      }, 1500);
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      請扮演一位華爾街資深分析師，針對股票代號 ${symbol} 進行簡短的技術與基本面分析。
      
      當前市場數據：
      - 現價: ${quote.c}
      - 今日漲跌: ${quote.d} (${quote.dp}%)
      - 今日最高: ${quote.h}
      - 今日最低: ${quote.l}
      
      請提供：
      1. 市場情緒總結 (Bullish/Bearish/Neutral)
      2. 3個關鍵觀察點
      3. 短期投資建議 (Buy/Hold/Sell)
      
      請用繁體中文回答，語氣專業且簡潔 (200字以內)。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "無法生成分析結果。";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "分析服務暫時無法使用，請稍後再試。";
  }
};
