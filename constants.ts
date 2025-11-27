import { StockData, TradeRecord, MarketQuote } from './types';

// 預設股票代號
export const DEFAULT_SYMBOL = 'AAPL';

// 產生模擬的 K 線資料
export const generateMockStockData = (days: number = 30): StockData[] => {
  const data: StockData[] = [];
  let price = 150;
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  for (let i = days; i >= 0; i--) {
    const date = now - i * oneDay;
    const volatility = price * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    data.push({
      t: date,
      o: parseFloat(open.toFixed(2)),
      h: parseFloat(high.toFixed(2)),
      l: parseFloat(low.toFixed(2)),
      c: parseFloat(close.toFixed(2)),
      v: volume,
    });

    price = close;
  }
  return data;
};

// 產生模擬報價
export const MOCK_QUOTE: MarketQuote = {
  c: 154.32,
  d: 2.15,
  dp: 1.41,
  h: 155.00,
  l: 151.20,
  o: 152.10,
  pc: 152.17,
};

// 產生模擬交易紀錄
export const MOCK_TRADES: TradeRecord[] = [
  { id: 'tx_1', symbol: 'AAPL', action: 'BUY', price: 145.20, quantity: 10, timestamp: Date.now() - 86400000 * 5, status: 'SUCCESS' },
  { id: 'tx_2', symbol: 'TSLA', action: 'BUY', price: 210.50, quantity: 5, timestamp: Date.now() - 86400000 * 3, status: 'SUCCESS' },
  { id: 'tx_3', symbol: 'NVDA', action: 'BUY', price: 420.00, quantity: 2, timestamp: Date.now() - 86400000 * 2, status: 'SUCCESS' },
  { id: 'tx_4', symbol: 'AAPL', action: 'SELL', price: 155.00, quantity: 2, timestamp: Date.now() - 3600000, status: 'SUCCESS' },
];

export const TIME_RANGES = [
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
  { label: '1M', value: 'M' },
];
