
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
  CheckCircle2,
  Users,
  Receipt,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';

const StatCard = ({ title, value, icon: Icon, sub, trend, color, className = '' }: any) => (
  <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} shadow-sm`}>
        <Icon size={22} className="text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${
          trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
    {sub && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub}</p>}
  </div>
);

const QuickAction = ({ to, icon: Icon, label, description, color }: any) => (
  <Link to={to} className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-black text-sm text-slate-900">{label}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{description}</p>
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
  </Link>
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
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} className="text-blue-600 fill-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Workspace Live</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">"{state.settings.business.name}" mission control</p>
        </div>
        <div className="no-print flex items-center gap-4">
          <DateRangePicker currentRange={dateRange} onRangeChange={setDateRange} />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalEarned, currencyCode)} icon={TrendingUp} color="bg-emerald-600" sub="Verified payouts" trend={12} />
        <StatCard title="Active Projects" value={stats.activeCount} icon={Briefcase} color="bg-blue-600" sub="Mandates in orbit" trend={5} />
        <StatCard title="Total Clients" value={state.clients.length} icon={Users} color="bg-indigo-600" sub="Partner network" />
        <StatCard title="Outstanding" value={formatCurrency(state.salesDocuments.filter(d => d.status !== 'paid' && d.status !== 'draft').reduce((acc, d) => acc + d.total, 0), currencyCode)} icon={AlertCircle} color="bg-amber-600" sub="Pending collection" />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction to="/clients" icon={Plus} label="New Client" description="Expand your network" color="bg-indigo-500" />
        <QuickAction to="/projects" icon={Briefcase} label="Start Project" description="New mandate setup" color="bg-blue-500" />
        <QuickAction to="/billing/new" icon={Receipt} label="Draft Invoice" description="Request payment" color="bg-emerald-500" />
      </div>

      {/* Revenue Chart */}
      <EarningsChart data={earningsData} onRangeChange={setEarningsFilter} totalRevenue={stats.totalEarned} />

      {/* Detailed Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Mandates</h2>
              <Link to="/projects" className="text-[10px] font-black text-blue-600 uppercase hover:underline">View All Mandates</Link>
            </div>
            <div className="flex-1 overflow-auto">
              {projectSummary.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white/80 backdrop-blur-md">
                    <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-8 py-4">Client Project</th>
                      <th className="px-8 py-4 text-center">Deadline</th>
                      <th className="px-8 py-4 text-right">Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {projectSummary.map((project) => {
                      const status = getProjectDisplayStatus(project);
                      return (
                        <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <Link to={`/projects/${project.id}`} className="block">
                              <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{project.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                {state.clients.find(c => c.id === project.clientId)?.company || 'Independent'}
                              </p>
                            </Link>
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
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Briefcase size={32} />
                  </div>
                  <h3 className="text-slate-900 font-black mb-1">No Active Projects</h3>
                  <p className="text-slate-500 text-xs mb-6">Kickstart your workflow by adding your first project.</p>
                  <Link to="/projects" className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Initialize Project
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h2>
              <FileText size={16} className="text-slate-300" />
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-auto">
              {recentDocs.length > 0 ? recentDocs.map((doc) => {
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
              }) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">No recent transactions</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-50 bg-slate-50/50">
              <Link to="/billing" className="block w-full text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                Audit Full Financials
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
