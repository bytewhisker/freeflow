
import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface EarningsChartProps {
  data: { month: string; earnings: number }[];
  totalRevenue: number;
  onRangeChange: (filter: string) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-xl relative mb-2 border border-slate-700">
        <p className="text-xs font-bold tracking-tight">${payload[0].value.toLocaleString()}</p>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45" />
      </div>
    );
  }
  return null;
};

const formatYAxis = (value: number) => {
  if (value === 0) return '0';
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
};

const EarningsChart: React.FC<EarningsChartProps> = ({ data, totalRevenue, onRangeChange }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl  dark:border-slate-800 shadow-md overflow-hidden w-full p-4 sm:p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[10px] font-bold mb-1 uppercase text-slate-400 dark:text-slate-500">Total Revenue</h2>
          <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

       
      </div>

      <div className="h-[350px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              tickFormatter={(val) => val.slice(0, 3)}
              dy={15}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              tickFormatter={formatYAxis}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsChart;
