import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PortfolioItem, TradeRecord } from '../types';
import { calculatePortfolio } from '../services/tradingService';

interface Props {
  trades: TradeRecord[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AssetDashboard: React.FC<Props> = ({ trades }) => {
  const portfolio = useMemo(() => calculatePortfolio(trades), [trades]);
  
  const totalValue = portfolio.reduce((acc, curr) => acc + curr.currentValue, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 mb-4">資產配置</h2>
      
      <div className="mb-6">
        <p className="text-sm text-slate-500 mb-1">總資產估值 (USD)</p>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex-1 min-h-[200px]">
        {portfolio.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolio}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="currentValue"
              >
                {portfolio.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: 'none' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            尚無持倉數據
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3 max-h-[150px] overflow-y-auto">
        {portfolio.map((item, idx) => (
          <div key={item.symbol} className="flex justify-between items-center text-sm border-b border-slate-50 py-2 last:border-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
              <span className="font-medium text-slate-700">{item.symbol}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900">${item.currentValue.toLocaleString()}</div>
              <div className="text-xs text-slate-500">{item.totalQuantity} 股</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetDashboard;
