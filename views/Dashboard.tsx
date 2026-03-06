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
  <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl  dark:border-slate-800 shadow-lg hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${className}`}>
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${color} shadow-sm`}>
        <Icon size={20} className="drop-shadow-sm" />
      </div>
      {/* Trend indicator omitted for brevity as it was empty */}
    </div>
    <h3 className="text-black dark:text-slate-300 text-[15px] font-bold mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
    {sub && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">{sub}</p>}
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
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      return invoiceDate >= start && invoiceDate <= end;
    });

    // Total Revenue: All issued invoices (excluding drafts and rejected)
    const totalRevenue = filteredInvoices
      .filter(i => i.status !== 'draft' && i.status !== 'rejected')
      .reduce((acc, i) => acc + i.total, 0);

    // Total Earned: Only paid invoices
    const totalEarned = filteredInvoices
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + i.total, 0);

    const activeCount = state.projects.filter(p => p.status === 'active').length;
    const completedCount = state.projects.filter(p => p.status === 'completed').length;
    const pendingCount = state.projects.filter(p => p.status === 'on_hold').length;

    return { totalRevenue, totalEarned, activeCount, completedCount, pendingCount };
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

    state.salesDocuments
      .filter(doc => doc.type === 'INVOICE' && doc.status !== 'draft' && doc.status !== 'rejected')
      .forEach(doc => {
        const docDate = new Date(doc.createdAt);
        const chartIndex = chartData.findIndex(data => data.monthIndex === docDate.getMonth() && data.year === docDate.getFullYear());
        if (chartIndex !== -1) chartData[chartIndex].earnings += doc.total;
      });

    return chartData.map(({ month, earnings }) => ({ month, earnings }));
  }, [state.salesDocuments, earningsFilter]);

  const chartTotalRevenue = useMemo(() => {
    return earningsData.reduce((acc, curr) => acc + curr.earnings, 0);
  }, [earningsData]);

  const projectSummary = useMemo(() => {
    return [...state.projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [state]);

  const recentDocs = useMemo(() => {
    return [...state.salesDocuments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [state]);

  const getProjectDisplayStatus = (project: Project) => {
    if (project.status === 'completed') return { label: 'Completed', color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' };
    if (project.status === 'on_hold') return { label: 'At Risk', color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' };
    return { label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' };
  };






  return (
    <div className="min-h-screen m-0 p-4 sm:p-6 pt-4 bg-slate-50 dark:bg-slate-950">
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 ">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          </div>
          <div className="no-print">
            <DateRangePicker currentRange={dateRange} onRangeChange={setDateRange} />
          </div>
        </div>





















        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue, currencyCode)} icon={TrendingUp} color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" sub={`In ${dateRange.label}`} trend={12} className="h-[160px]" />
          <StatCard title="Active Projects" value={stats.activeCount} icon={Clock} color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" sub="" trend={5} className="h-[160px]" />
          <StatCard title="Completed Projects" value={stats.completedCount} icon={CheckCircle2} color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" sub="" className="h-[160px]" />
          <StatCard title="Pending Projects" value={stats.pendingCount} icon={AlertCircle} color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" sub="" className="h-[160px]" />
        </div>

        <EarningsChart data={earningsData} onRangeChange={setEarningsFilter} totalRevenue={chartTotalRevenue} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl  dark:border-slate-800 shadow-sm overflow-hidden h-[450px] flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white font-open-sans">Project Health</h2>
                <Briefcase size={18} className="text-slate-300 dark:text-black" />
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold font-open-sans border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4">Client Project</th>
                      <th className="px-6 py-4 text-center">Deadline</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {projectSummary.map((project) => {
                      const status = getProjectDisplayStatus(project);
                      return (
                        <tr key={project.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200">
                          <td className="px-6 py-4">
                            <p className="font-bold text-sm text-slate-900 dark:text-white font-open-sans leading-tight">{project.title || 'Untitled Project'}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-normal mt-0.5">
                              {state.clients.find(c => c.id === project.clientId)?.company || 'Independent'}
                            </p>
                          </td>
                          <td className="py-4 text-sm text-black dark:text-slate-400 font-bold text-center font-open-sans">{formatDate(project.deadline)}</td>
                          <td className="py-4 text-right px-6">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold font-open-sans ${status.color}`}>
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl   dark:border-slate-800 shadow-sm overflow-hidden h-auto lg:h-[450px] flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white font-open-sans">Activity</h2>
                <FileText size={18} className="text-slate-300 dark:text-black" />
              </div>
              <div className="flex-1 p-3 space-y-1 overflow-auto">
                {recentDocs.map((doc) => {
                  const client = state.clients.find(c => c.id === doc.clientId);
                  return (
                    <Link key={doc.id} to={`/billing/view/${doc.id}`} className="flex items-center justify-between p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${doc.type === 'QUOTATION' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600'}`}>
                          {doc.type[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white font-open-sans">{client?.name || doc.billTo?.split('\n')[0] || 'Private Client'}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{doc.docNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base text-slate-900 dark:text-white font-open-sans">{formatCurrency(doc.total, currencyCode)}</p>
                        <span className={`text-[10px] font-bold font-open-sans px-2.5 py-1 rounded-full ${getStatusColor(doc.status)}`}>
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
    </div>
  );
};

export default Dashboard;
