import React, { useState, useEffect } from 'react';
import { AppMode, MarketQuote, TradeRecord } from '../types';
import { fetchQuote, executeTradeOrder, getTradeHistory } from '../services/tradingService';

interface Props {
  mode: AppMode;
  symbol: string;
  onSymbolChange: (s: string) => void;
  onTradeUpdate: (trades: TradeRecord[]) => void;
}

const TradePanel: React.FC<Props> = ({ mode, symbol, onSymbolChange, onTradeUpdate }) => {
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TradeRecord[]>([]);
  const [inputSymbol, setInputSymbol] = useState(symbol);

  // Load initial history
  useEffect(() => {
    getTradeHistory(mode).then(data => {
      setHistory(data);
      onTradeUpdate(data);
    });
  }, [mode]);

  // Sync symbol input
  useEffect(() => {
    setInputSymbol(symbol);
  }, [symbol]);

  const handleQuote = async () => {
    setLoading(true);
    const q = await fetchQuote(inputSymbol, mode);
    setQuote(q);
    onSymbolChange(inputSymbol); // Update global symbol
    setLoading(false);
  };

  const handleTrade = async () => {
    if (!quote) return;
    setLoading(true);
    
    try {
      const tradeData = {
        symbol: inputSymbol,
        action,
        price: quote.c,
        quantity,
        timestamp: Date.now()
      };

      const newTrade = await executeTradeOrder(tradeData, mode);
      const updatedHistory = [newTrade, ...history];
      setHistory(updatedHistory);
      onTradeUpdate(updatedHistory);
      
      // Reset logic simplified
      alert(`交易成功！以 $${quote.c} ${action === 'BUY' ? '買入' : '賣出'} ${quantity} 股 ${inputSymbol}`);
    } catch (e) {
      alert('交易失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 mb-4">下單交易</h2>

      {/* Symbol Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputSymbol}
          onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold text-slate-700"
          placeholder="股票代號"
        />
        <button
          onClick={handleQuote}
          disabled={loading}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          詢價
        </button>
      </div>

      {/* Quote Display */}
      <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-100">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-slate-500">當前價格</span>
          {quote ? (
            <div className="text-right">
              <span className={`text-2xl font-bold ${quote.d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${quote.c.toFixed(2)}
              </span>
              <div className={`text-xs ${quote.d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {quote.d > 0 ? '+' : ''}{quote.d.toFixed(2)} ({quote.dp.toFixed(2)}%)
              </div>
            </div>
          ) : (
            <span className="text-slate-400">---</span>
          )}
        </div>
      </div>

      {/* Order Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="col-span-2 flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setAction('BUY')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              action === 'BUY' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            買入
          </button>
          <button
            onClick={() => setAction('SELL')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              action === 'SELL' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            賣出
          </button>
        </div>
        
        <div className="col-span-2">
            <label className="text-xs text-slate-500 mb-1 block">數量 (股)</label>
            <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
        </div>
      </div>

      <button
        onClick={handleTrade}
        disabled={loading || !quote}
        className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-transform active:scale-[0.98] ${
            action === 'BUY' 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-red-600 hover:bg-red-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? '處理中...' : `確認${action === 'BUY' ? '買入' : '賣出'}`}
      </button>

      {/* Recent History Table */}
      <div className="mt-6 flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-bold text-slate-700 mb-2">歷史委託</h3>
        <div className="overflow-y-auto flex-1 border border-slate-200 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 sticky top-0">
              <tr>
                <th className="px-3 py-2 font-medium">代號</th>
                <th className="px-3 py-2 font-medium">方向</th>
                <th className="px-3 py-2 font-medium">價格</th>
                <th className="px-3 py-2 font-medium">量</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-700">{t.symbol}</td>
                  <td className={`px-3 py-2 font-bold ${t.action === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.action === 'BUY' ? '買' : '賣'}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{t.price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-600">{t.quantity}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-slate-400">尚無交易紀錄</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradePanel;
