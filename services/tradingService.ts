import { AppMode, StockData, MarketQuote, TradeRecord, PortfolioItem } from '../types';
import { generateMockStockData, MOCK_QUOTE, MOCK_TRADES } from '../constants';

// --- 環境變數與設定 ---
const FINNHUB_KEY = process.env.VITE_FINNHUB_API_KEY || '';
// 這裡僅為示範，真實情況下 Firebase 需要完整初始化流程，這裡簡化處理
const FIREBASE_CONFIG = process.env.VITE_FIREBASE_CONFIG_STRING || '';

/**
 * 檢查環境是否具備真實模式的條件
 */
export const checkEnvironmentReady = (): boolean => {
  return !!FINNHUB_KEY && FINNHUB_KEY.length > 0;
};

/**
 * 獲取股票 K 線資料 (Hybrid)
 * @param symbol 股票代號
 * @param mode 當前模式
 */
export const fetchStockHistory = async (symbol: string, resolution: string, mode: AppMode): Promise<StockData[]> => {
  // [繁體中文註解] 如果是模擬模式，直接返回隨機生成的假資料
  if (mode === AppMode.MOCK) {
    console.log(`[Mock Mode] Generating history for ${symbol}`);
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockStockData(resolution === '1D' ? 1 : 30)), 600);
    });
  }

  // [真實模式] 呼叫 Finnhub API
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution === '1D' ? '15' : 'D'}&from=${Math.floor((Date.now() - 2592000000) / 1000)}&to=${Math.floor(Date.now() / 1000)}&token=${FINNHUB_KEY}`
    );
    const data = await res.json();
    if (data.s === 'ok') {
      return data.t.map((timestamp: number, index: number) => ({
        t: timestamp * 1000,
        o: data.o[index],
        h: data.h[index],
        l: data.l[index],
        c: data.c[index],
        v: data.v[index],
      }));
    }
    throw new Error('API Error');
  } catch (error) {
    console.warn('[Real Mode Failed] Fallback to Mock data due to API error:', error);
    return generateMockStockData(30);
  }
};

/**
 * 獲取即時報價 (Hybrid)
 */
export const fetchQuote = async (symbol: string, mode: AppMode): Promise<MarketQuote> => {
  // [繁體中文註解] 模擬模式：回傳靜態常數並加上一點隨機波動
  if (mode === AppMode.MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomFluctuation = (Math.random() - 0.5) * 2;
        resolve({ ...MOCK_QUOTE, c: MOCK_QUOTE.c + randomFluctuation });
      }, 400);
    });
  }

  // [真實模式]
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const data = await res.json();
    if (data.c) return data;
    throw new Error('Quote fetch failed');
  } catch (error) {
    console.error(error);
    return MOCK_QUOTE;
  }
};

/**
 * 執行交易 (Hybrid)
 * 在模擬模式下，我們使用 localStorage 來模擬資料庫持久化
 */
export const executeTradeOrder = async (trade: Omit<TradeRecord, 'id' | 'status'>, mode: AppMode): Promise<TradeRecord> => {
  const newTrade: TradeRecord = {
    ...trade,
    id: `tx_${Date.now()}`,
    status: 'SUCCESS',
  };

  if (mode === AppMode.MOCK) {
    // [繁體中文註解] 模擬模式：存入 LocalStorage
    const stored = localStorage.getItem('mock_trades');
    const currentTrades = stored ? JSON.parse(stored) : MOCK_TRADES;
    const updatedTrades = [newTrade, ...currentTrades];
    localStorage.setItem('mock_trades', JSON.stringify(updatedTrades));
    
    return new Promise((resolve) => setTimeout(() => resolve(newTrade), 800));
  }

  // [真實模式] 這裡應該呼叫 Firebase SDK (此處為了代碼安全性與複雜度，僅模擬異步請求，實際專案需在此處寫入 Firestore)
  // 此處示範真實模式下的 API 呼叫結構
  console.log('[Real Mode] Writing to Firestore...', FIREBASE_CONFIG ? 'Config Present' : 'No Config');
  return new Promise((resolve) => setTimeout(() => resolve(newTrade), 1000));
};

/**
 * 獲取交易歷史
 */
export const getTradeHistory = async (mode: AppMode): Promise<TradeRecord[]> => {
  if (mode === AppMode.MOCK) {
    const stored = localStorage.getItem('mock_trades');
    return stored ? JSON.parse(stored) : MOCK_TRADES;
  }
  
  // Real mode would fetch from Firestore
  return MOCK_TRADES; // Fallback for prototype
};

/**
 * 計算資產配置 (由交易紀錄計算)
 */
export const calculatePortfolio = (trades: TradeRecord[]): PortfolioItem[] => {
  const portfolio: Record<string, PortfolioItem> = {};
  
  trades.forEach(t => {
    if (!portfolio[t.symbol]) {
      portfolio[t.symbol] = {
        symbol: t.symbol,
        totalQuantity: 0,
        averagePrice: 0, // Simplified
        currentValue: 0,
        allocation: 0
      };
    }
    
    if (t.action === 'BUY') {
      portfolio[t.symbol].totalQuantity += t.quantity;
    } else {
      portfolio[t.symbol].totalQuantity -= t.quantity;
    }
  });

  // Filter out zero holdings and calculate mock current value (price * quantity)
  // In a real app, we would need current prices for all symbols.
  // Here we approximate with the last trade price or a mock price.
  const items = Object.values(portfolio).filter(i => i.totalQuantity > 0).map(i => {
    i.currentValue = i.totalQuantity * 150; // Approximated price for demo
    return i;
  });

  const totalValue = items.reduce((acc, curr) => acc + curr.currentValue, 0);
  items.forEach(i => {
    i.allocation = totalValue > 0 ? (i.currentValue / totalValue) * 100 : 0;
  });

  return items;
};
