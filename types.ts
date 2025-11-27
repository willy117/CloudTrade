// 定義系統核心型別

export interface StockData {
  t: number; // Timestamp
  o: number; // Open
  h: number; // High
  l: number; // Low
  c: number; // Close
  v: number; // Volume
}

export interface TradeRecord {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  status: 'SUCCESS' | 'FAILED';
}

export interface PortfolioItem {
  symbol: string;
  totalQuantity: number;
  averagePrice: number;
  currentValue: number;
  allocation: number; // Percentage
}

export interface MarketQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High of day
  l: number; // Low of day
  o: number; // Open of day
  pc: number; // Previous close
}

// 系統運作模式
export enum AppMode {
  MOCK = 'MOCK',
  REAL = 'REAL',
}

export interface AppState {
  mode: AppMode;
  symbol: string;
}
