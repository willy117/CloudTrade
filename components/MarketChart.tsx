import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { AppMode, StockData } from '../types';
import { fetchStockHistory } from '../services/tradingService';
import { TIME_RANGES } from '../constants';

interface Props {
  symbol: string;
  mode: AppMode;
}

const MarketChart: React.FC<Props> = ({ symbol, mode }) => {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('1M');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      const result = await fetchStockHistory(symbol, range, mode);
      if (isMounted) {
        setData(result);
        setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [symbol, range, mode]);

  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">{symbol}</span>
            行情走勢
          </h2>
          <p className="text-xs text-slate-500 mt-1">價格/成交量混合圖表</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 text-sm rounded-md transition-all font-medium ${
                range === r.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="t" 
              tickFormatter={formatXAxis} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(val) => `$${val.toFixed(2)}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, '價格']}
            />
            <Area
              type="monotone"
              dataKey="c"
              stroke="#2563eb"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Volume Chart (Simplified below) */}
      <div className="h-16 mt-2">
        <ResponsiveContainer width="100%" height="100%">
           <BarChart data={data}>
             <Bar dataKey="v" fill="#cbd5e1" radius={[2, 2, 0, 0]} />
           </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketChart;
