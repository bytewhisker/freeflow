
import React, { useMemo, useState } from 'react';
import { AppState, Project } from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../utils';
import EarningsChart from '../components/EarningsChart';
import {
  TrendingUp,
  Clock,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Plus,
  Briefcase,
  FileText,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';

const StatCard = ({ title, value, icon: Icon, sub, trend, color, className = '' }: any) => (
  <div className={`bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${className}`}>
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${color} shadow-sm`}>
        <Icon size={20} className="drop-shadow-sm" />
      </div>
      {trend && (
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold ${
          trend > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${trend > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-[15px] font-bold uppercase tracking-wide mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
    {sub && <p className="text-[10px] text-slate-500 font-medium tracking-wide">{sub}</p>}
  </div>
);

const Dashboard: React.FC<{ state: AppState }> = ({ state }) => {
  const currencyCode = state.settings.currency.code;
  
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end, label: 'Last 30 days' };
  });

  const stats = useMemo(() => {
    const invoices = state.salesDocuments.filter(d => d.type === 'INVOICE');
    
    const filteredInvoices = invoices.filter(i => {
      if (!dateRange.start || !dateRange.end) return true;
      const invoiceDate = new Date(i.createdAt);
      return invoiceDate >= dateRange.start && invoiceDate <= dateRange.end;
    });
    
    const totalEarned = filteredInvoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.total, 0);
    const activeCount = state.projects.filter(p => p.status === 'active').length;
    const completedCount = state.projects.filter(p => p.status === 'completed').length;
    const pendingCount = state.projects.filter(p => p.status === 'on_hold').length;

    return { totalEarned, activeCount, completedCount, pendingCount };
  }, [state, dateRange]);

  const [earningsFilter, setEarningsFilter] = useState('12months');

  const getDateRangeForFilter = (filter: string): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();
    switch (filter) {
      case '7days': start.setDate(start.getDate() - 7); break;
      case '30days': start.setDate(start.getDate() - 30); break;
      case '90days': start.setDate(start.getDate() - 90); break;
      case '12months': start.setFullYear(start.getFullYear() - 1); break;
      case '2025': start.setFullYear(2025, 0, 1); end.setFullYear(2025, 11, 31); break;
      case '2024': start.setFullYear(2024, 0, 1); end.setFullYear(2024, 11, 31); break;
      case 'all': start.setFullYear(2020, 0, 1); break;
      default: start.setFullYear(start.getFullYear() - 1);
    }
    return { start, end };
  };

  const earningsData = useMemo(() => {
    const { start: filterStart, end: filterEnd } = getDateRangeForFilter(earningsFilter);
    const months: { month: string; year: number; monthIndex: number }[] = [];
    let current = new Date(filterStart.getFullYear(), filterStart.getMonth(), 1);
    const rangeEnd = new Date(filterEnd.getFullYear(), filterEnd.getMonth() + 1, 0);
    
    while (current <= rangeEnd) {
      months.push({
        month: current.toLocaleString('default', { month: 'long' }),
        year: current.getFullYear(),
        monthIndex: current.getMonth()
      });
      current.setMonth(current.getMonth() + 1);
    }

    const chartData = months.map(data => ({ month: data.month, year: data.year, monthIndex: data.monthIndex, earnings: 0 }));

    state.salesDocuments.filter(doc => doc.status === 'paid').forEach(doc => {
      const docDate = new Date(doc.createdAt);
      const chartIndex = chartData.findIndex(data => data.monthIndex === docDate.getMonth() && data.year === docDate.getFullYear());
      if (chartIndex !== -1) chartData[chartIndex].earnings += doc.total;
    });

    return chartData.map(({ month, earnings }) => ({ month, earnings }));
  }, [state.salesDocuments, earningsFilter]);

  const projectSummary = useMemo(() => {
    return [...state.projects].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5);
  }, [state]);

  const recentDocs = useMemo(() => {
    return [...state.salesDocuments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [state]);

  const getProjectDisplayStatus = (project: Project) => {
    if (project.status === 'completed') return { label: 'Completed', color: 'bg-emerald-50 text-emerald-600' };
    if (project.status === 'on_hold') return { label: 'At Risk', color: 'bg-rose-50 text-rose-600' };
    return { label: 'In Progress', color: 'bg-blue-50 text-blue-600' };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Business performance and financial trajectory</p>
        </div>
        <div className="no-print">
          <DateRangePicker currentRange={dateRange} onRangeChange={setDateRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Earnings" value={formatCurrency(stats.totalEarned, currencyCode)} icon={TrendingUp} color="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" sub="received net income" trend={12} className="h-[160px]" />
        <StatCard title="Active Projects" value={stats.activeCount} icon={Clock} color="bg-gradient-to-br from-blue-500 to-blue-600 text-white" sub="currently ongoing" trend={5} className="h-[160px]" />
        <StatCard title="Completed Projects" value={stats.completedCount} icon={CheckCircle2} color="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" sub="archived mandates" className="h-[160px]" />
        <StatCard title="Pending Projects" value={stats.pendingCount} icon={AlertCircle} color="bg-gradient-to-br from-amber-500 to-amber-600 text-white" sub="awaiting review" className="h-[160px]" />
      </div>

      <EarningsChart data={earningsData} onRangeChange={setEarningsFilter} totalRevenue={stats.totalEarned} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-lg font-black text-slate-900">Project Health</h2>
              <Briefcase size={18} className="text-slate-300" />
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white/80 backdrop-blur-md">
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-4">Client Project</th>
                    <th className="px-8 py-4 text-center">Deadline</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projectSummary.map((project) => {
                    const status = getProjectDisplayStatus(project);
                    return (
                      <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-bold text-sm text-slate-900">{project.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            {state.clients.find(c => c.id === project.clientId)?.company || 'Independent'}
                          </p>
                        </td>
                        <td className="py-6 text-sm text-slate-500 font-bold text-center">{formatDate(project.deadline)}</td>
                        <td className="py-6 text-right px-8">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-lg font-black text-slate-900">Activity</h2>
              <FileText size={18} className="text-slate-300" />
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-auto">
              {recentDocs.map((doc) => {
                const client = state.clients.find(c => c.id === doc.clientId);
                return (
                  <Link key={doc.id} to={`/billing/view/${doc.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${doc.type === 'QUOTATION' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        {doc.type[0]}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{client?.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doc.docNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-slate-900">{formatCurrency(doc.total, currencyCode)}</p>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
