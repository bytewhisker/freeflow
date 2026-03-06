
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface EarningsChartProps {
  data: { month: string; earnings: number }[];
  onRangeChange?: (range: string) => void;
  totalRevenue: number;
}

const ranges = [
  { label: 'Weekly', value: '7days' },
  { label: 'Monthly', value: '30days' },
  { label: 'Quarterly', value: '90days' },
  { label: 'Yearly', value: '12months' },
  { label: 'All time', value: 'all' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl relative mb-2">
        <p className="text-xs font-black tracking-tight">${payload[0].value.toLocaleString()}</p>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
      </div>
    );
  }
  return null;
};

const EarningsChart: React.FC<EarningsChartProps> = ({ data, onRangeChange, totalRevenue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('12months');

  const handleRangeSelect = (value: string) => {
    setSelectedRange(value);
    setIsOpen(false);
    if (onRangeChange) {
      onRangeChange(value);
    }
  };

  const currentRangeLabel = ranges.find(r => r.value === selectedRange)?.label || 'Yearly';

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full p-8">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-4">Total Revenue</h2>
          <p className="text-4xl font-black text-slate-900 tracking-tight">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-black hover:bg-slate-50 transition-all"
          >
            <span>{currentRangeLabel}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {ranges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleRangeSelect(range.value)}
                  className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors ${selectedRange === range.value
                      ? 'bg-slate-50 text-slate-900'
                      : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[300px] w-full mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000000" stopOpacity={0.05} />
                <stop offset="95%" stopColor="#000000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => val.slice(0, 3)}
              dy={15}
            />
            <YAxis
              hide={true}
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#111827"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{ r: 4, fill: '#111827', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsChart;
