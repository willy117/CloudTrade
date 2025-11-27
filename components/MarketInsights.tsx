import React, { useState, useEffect } from 'react';
import { AppMode } from '../types';
import { fetchQuote } from '../services/tradingService';
import { generateMarketInsight } from '../services/geminiService';

interface Props {
  symbol: string;
  mode: AppMode;
}

const MarketInsights: React.FC<Props> = ({ symbol, mode }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 當股票代號改變時，自動重新分析
  useEffect(() => {
    let isMounted = true;
    
    const analyze = async () => {
      setLoading(true);
      setInsight('');
      
      try {
        // 先獲取最新報價
        const quote = await fetchQuote(symbol, mode);
        // 呼叫 Gemini
        const result = await generateMarketInsight(symbol, quote, mode);
        
        if (isMounted) {
          setInsight(result);
        }
      } catch (err) {
        if (isMounted) setInsight('分析發生錯誤。');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (symbol) {
      analyze();
    }
    
    return () => { isMounted = false; };
  }, [symbol, mode]);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      
      <div className="relative z-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Gemini 市場洞察 - {symbol}
        </h2>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-h-[140px] text-sm leading-relaxed border border-white/20">
          {loading ? (
            <div className="flex items-center gap-3 text-indigo-200">
               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI 正在分析大數據與即時行情...
            </div>
          ) : (
            <div className="whitespace-pre-wrap font-light tracking-wide">
              {insight}
            </div>
          )}
        </div>
        
        <div className="mt-3 flex justify-between items-center text-xs text-indigo-200 opacity-80">
          <span>Powered by Google Gemini 2.5</span>
          {mode === AppMode.MOCK && (
            <span className="bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded">模擬模式預覽</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;
