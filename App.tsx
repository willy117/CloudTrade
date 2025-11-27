import React, { useState, useEffect } from 'react';
import { AppMode, TradeRecord } from './types';
import { DEFAULT_SYMBOL } from './constants';
import { checkEnvironmentReady } from './services/tradingService';

// Components
import MarketChart from './components/MarketChart';
import AssetDashboard from './components/AssetDashboard';
import TradePanel from './components/TradePanel';
import MarketInsights from './components/MarketInsights';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.MOCK);
  const [symbol, setSymbol] = useState<string>(DEFAULT_SYMBOL);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [isEnvReady, setIsEnvReady] = useState(false);

  useEffect(() => {
    // 檢查環境變數
    const ready = checkEnvironmentReady();
    setIsEnvReady(ready);
    // [繁體中文註解] 如果環境變數存在，預設切換到真實模式；否則強制保持模擬模式
    if (ready) {
      setMode(AppMode.REAL);
    }
  }, []);

  const toggleMode = () => {
    if (!isEnvReady && mode === AppMode.MOCK) {
      alert('未偵測到 API Key，無法切換至真實模式。\n(Preview Mode Only)');
      return;
    }
    setMode(prev => prev === AppMode.MOCK ? AppMode.REAL : AppMode.MOCK);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">CloudTrade <span className="text-blue-600">Alpha</span></span>
            </div>

            <div className="flex items-center gap-4">
               {/* Mode Switcher */}
               <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer transition-colors select-none ${
                  mode === AppMode.REAL 
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                }`}
                onClick={toggleMode}
              >
                <div className={`w-2 h-2 rounded-full ${mode === AppMode.REAL ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                {mode === AppMode.REAL ? '真實交易模式' : '模擬預覽模式'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Top Grid: Chart & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <MarketChart symbol={symbol} mode={mode} />
          </div>
          <div className="flex flex-col gap-6">
             <MarketInsights symbol={symbol} mode={mode} />
             {/* Asset Dashboard fits nicely under insights or as a secondary block */}
             <div className="flex-1 min-h-[300px]">
                <AssetDashboard trades={trades} />
             </div>
          </div>
        </div>

        {/* Bottom Grid: Trading Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
             <TradePanel 
                mode={mode} 
                symbol={symbol} 
                onSymbolChange={setSymbol}
                onTradeUpdate={setTrades}
              />
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">系統狀態監控</h3>
                <span className="text-xs text-slate-400 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="text-xs text-slate-500">API 連線</div>
                   <div className="text-sm font-semibold text-green-600 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 正常
                   </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="text-xs text-slate-500">Firestore</div>
                   <div className={`text-sm font-semibold flex items-center gap-1 ${mode === AppMode.REAL && isEnvReady ? 'text-green-600' : 'text-slate-400'}`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${mode === AppMode.REAL && isEnvReady ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                     {mode === AppMode.REAL && isEnvReady ? '已連線' : '本機模擬'}
                   </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="text-xs text-slate-500">Gemini AI</div>
                   <div className="text-sm font-semibold text-indigo-600">待命</div>
                </div>
                 <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="text-xs text-slate-500">延遲</div>
                   <div className="text-sm font-semibold text-slate-700">24ms</div>
                </div>
             </div>
             <div className="mt-4 text-xs text-slate-400">
                系統提示：您目前處於{mode === AppMode.REAL ? '真實資金' : '模擬體驗'}環境，{mode === AppMode.REAL ? '所有交易將寫入資料庫。' : '數據僅存於瀏覽器暫存。'}
             </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
