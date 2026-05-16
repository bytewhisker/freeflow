import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppState, Project, SalesDocument, Client } from '../types';
import { formatDate, formatCurrency, formatRelativeTime } from '../utils';
import {
  X, Mail, Phone, Building2, MapPin, Plus, FileText,
  DollarSign, Calendar, Briefcase, Clock, CheckCircle, ChevronRight,
  MoreHorizontal, Send, Upload, Download, Search, Filter,
  TrendingUp, Award, Target, Zap, Star, Edit3,
  MessageSquare, FolderOpen, Activity, FileText as FileTextIcon,
  Check, AlertCircle, Image, Paperclip,
  PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Bell,
  User, CreditCard, RefreshCw, Eye, Edit, Trash,
  ChevronLeft
} from 'lucide-react';



interface ClientDetailProps {
  state: AppState;
  setState: any;
  clientId?: string;
  onClose?: () => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ state, setState, clientId: propClientId, onClose: propOnClose }) => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = propClientId || routeId || '';
  const onClose = propOnClose || (() => navigate('/clients'));

  const [activeTab, setActiveTab] = useState('overview');
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium',
    'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark', 'Egypt',
    'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'India', 'Indonesia', 'Ireland',
    'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico', 'Netherlands', 'New Zealand',
    'Nigeria', 'Norway', 'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Russia',
    'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland',
    'Thailand', 'Turkey', 'UAE', 'UK', 'USA', 'Vietnam'
  ].sort();

  const client = state.clients.find(c => c.id === clientId);
  const clientProjects: Project[] = state.projects.filter(p => p.clientId === clientId);
  const clientDocs: SalesDocument[] = state.salesDocuments.filter(d => d.clientId === clientId);

  const [animatedStats, setAnimatedStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    activeProjects: 0,
    avgInvoice: 0
  });

  useEffect(() => {
    if (client) {
      const targetStats = calculateStats();
      let frame = 0;
      const totalFrames = 20;

      const animate = () => {
        frame++;
        const progress = frame / totalFrames;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setAnimatedStats({
          totalRevenue: Math.round(targetStats.totalRevenue * easeOut),
          pendingAmount: Math.round(targetStats.pendingAmount * easeOut),
          activeProjects: Math.round(targetStats.activeProjects * easeOut),
          avgInvoice: Math.round(targetStats.avgInvoice * easeOut)
        });

        if (frame < totalFrames) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  }, [client]);

  function calculateStats() {
    const paidInvoices = clientDocs.filter(d => d.type === 'INVOICE' && d.status === 'paid');
    const pendingInvoices = clientDocs.filter(d => d.type === 'INVOICE' && (d.status === 'sent' || d.status === 'overdue'));
    const activeProjects = clientProjects.filter(p => p.status === 'active');

    const totalRevenue = paidInvoices.reduce((sum, d) => sum + d.total, 0);
    const pendingAmount = pendingInvoices.reduce((sum, d) => sum + d.total, 0);
    const avgInvoice = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

    return {
      totalRevenue,
      pendingAmount,
      activeProjects: activeProjects.length,
      avgInvoice
    };
  }

  const stats = useMemo(() => {
    const paidInvoices = clientDocs.filter(d => d.type === 'INVOICE' && d.status === 'paid');
    const pendingInvoices = clientDocs.filter(d => d.type === 'INVOICE' && (d.status === 'sent' || d.status === 'overdue'));
    const overdueInvoices = clientDocs.filter(d => d.type === 'INVOICE' && d.status === 'overdue');
    const activeProjects = clientProjects.filter(p => p.status === 'active');

    const totalRevenue = paidInvoices.reduce((sum, d) => sum + d.total, 0);
    const pendingAmount = pendingInvoices.reduce((sum, d) => sum + d.total, 0);
    const avgInvoice = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

    // Improved Health Score Calculation
    const budgetUtilization = activeProjects.reduce((sum, p) => sum + (p.totalBudget || 0), 0);
    const healthScore = Math.min(100, Math.round(
      (totalRevenue > 5000 ? 30 : (totalRevenue / 5000) * 30) +
      (activeProjects.length > 0 ? 30 : 0) +
      (overdueInvoices.length === 0 && pendingInvoices.length > 0 ? 20 : 0) +
      (paidInvoices.length > 3 ? 20 : (paidInvoices.length / 3) * 20)
    ));

    return {
      totalRevenue,
      pendingAmount,
      activeProjects: activeProjects.length,
      avgInvoice,
      overdueCount: overdueInvoices.length,
      completedProjects: clientProjects.filter(p => p.status === 'completed').length,
      healthScore,
      totalInvoices: clientDocs.length,
      paidInvoices: paidInvoices.length,
      pendingInvoices: pendingInvoices.length,
      budgetUtilization
    };
  }, [clientProjects, clientDocs]);

  const handleClose = () => {
    onClose();
  };

  const handleEdit = () => {
    if (client) {
      setEditForm({
        name: client.name,
        email: client.email,
        phone: client.phone,
        countryCode: client.countryCode || '+1',
        company: client.company || '',
        country: client.country || '',
        notes: client.notes || '',
        socialMedia: client.socialMedia || {}
      });
      setIsEditing(true);
    }
  };

  const handleUpdate = () => {
    if (!client) return;
    if (!editForm.name?.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }
    setState((prev: AppState) => ({
      ...prev,
      clients: prev.clients.map(c => c.id === clientId ? { ...c, ...editForm } : c)
    }));
    setIsEditing(false);
    setErrors({});
    setToast({ message: 'Client details updated successfully', type: 'success' });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setState((prev: AppState) => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== clientId),
      projects: prev.projects.filter(p => p.clientId !== clientId),
      salesDocuments: prev.salesDocuments.filter(d => d.clientId !== clientId)
    }));
    setShowDeleteConfirm(false);
    handleClose();
    // Use window alert just as fallback if needed, but the redirect happens immediately.
  };

  const statusColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    active: { bg: '#ECFDF5', text: '#166534', border: '#BBF7D0', glow: 'rgba(16, 185, 129, 0.3)' },
    on_hold: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', glow: 'rgba(245, 158, 11, 0.3)' },
    completed: { bg: '#E0F2FE', text: '#0E7490', border: '#B3E5FC', glow: 'rgba(14, 116, 144, 0.3)' },
    new: { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', glow: 'rgba(55, 65, 81, 0.1)' },
    inactive: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', glow: 'rgba(71, 85, 105, 0.2)' },
    archived: { bg: '#1E293B', text: '#94A3B8', border: '#334155', glow: 'rgba(30, 41, 59, 0.5)' },
    vip: { bg: '#FAE8FF', text: '#A21CAF', border: '#F5D0FE', glow: 'rgba(162, 28, 175, 0.3)' }
  };

  const clientStatusColor = statusColors[client?.status || 'new'] || statusColors.new;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'invoices', label: 'Invoices', icon: FileTextIcon },
    { id: 'activity', label: 'Activity', icon: Activity },

  ];

  const activityTimeline = useMemo(() => {
    const activities = [];

    clientDocs.forEach(doc => {
      activities.push({
        id: doc.id,
        type: doc.type === 'INVOICE' ? 'invoice' : 'doc',
        icon: FileTextIcon,
        color: doc.status === 'paid' ? '#10B981' : doc.status === 'overdue' ? '#EF4444' : '#0EA5E9',
        title: `${doc.type} ${doc.status}`,
        description: `${doc.docNumber} - ${formatCurrency(doc.total)}`,
        timestamp: doc.createdAt
      });
    });

    clientProjects.forEach(project => {
      activities.push({
        id: project.id,
        type: 'project',
        icon: Briefcase,
        color: project.status === 'active' ? '#10B981' : project.status === 'completed' ? '#8B5CF6' : '#F59E0B',
        title: `Project ${project.status}`,
        description: project.title,
        timestamp: project.createdAt || new Date().toISOString()
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  }, [clientProjects, clientDocs]);

  if (!client) {
    return (
      <div className="font-open-sans">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
            .font-open-sans, .font-open-sans * {
              font-family: 'Open Sans', sans-serif !important;
            }
          `}
        </style>
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 rounded-2xl p-10 text-center shadow-2xl border border-slate-200 max-w-sm w-full">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-6">
              <User size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Client not found</h2>
            <p className="text-slate-500 text-sm mb-8">The client you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              Back to Clients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center transition-colors duration-300">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@700&display=swap');
          
          :root {
            --accent: #000000;
            --accent-light: #f5f5f5;
            --border: #e0e0e0;
          }

          .font-open-sans {
            font-family: 'Open Sans', sans-serif !important;
            text-transform: none !important;
            font-weight: 700 !important;
          }

          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div className="max-w-[3000px] w-full min-h-[900px] bg-slate-50 dark:bg-slate-950 flex flex-col font-open-sans overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 md:px-6 md:py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 dark:bg-slate-900/50 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={handleClose} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-all font-bold text-sm font-open-sans">
              <ChevronLeft size={30} />
            </button>
            <div className="flex items-center gap-5">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white tracking-tight font-open-sans leading-none mb-1">{client.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold font-open-sans">
                  Private Client • Joined {formatDate(client.createdAt || new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="px-4 py-1.5 rounded-full text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-black dark:text-slate-200 font-open-sans">
              {client.status || 'Active'}
            </span>
            <button onClick={handleEdit} className="px-4 md:px-6 py-2 md:py-2.5 bg-black dark:bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all font-open-sans flex items-center gap-2">
              <Edit3 size={16} /> <span className="hidden sm:inline">Edit Client</span><span className="sm:hidden">Edit</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 hide-scrollbar">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue + stats.pendingAmount) },
              { label: 'Outstanding', value: formatCurrency(stats.pendingAmount) },
              { label: 'Active Projects', value: stats.activeProjects },
              { label: 'Total Invoices', value: stats.totalInvoices },
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6 sm:p-8 rounded-[20px] sm:rounded-[30px] border border-blue-100 dark:border-slate-700 shadow-sm text-center">
                <p className="text-base sm:text-[18px] font-bold text-black dark:text-slate-300 mb-2 font-open-sans">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white font-open-sans">{stat.value}</p>
              </div>
            ))}
          </div>











          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {[
              { label: 'New Project', icon: FolderOpen, className: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600', onClick: () => navigate('/projects', { state: { clientId: client.id } }) },
              { label: 'Message Client', icon: Send, className: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600', onClick: () => window.location.href = `mailto:${client.email}` },
              { label: 'New Invoice', icon: FileTextIcon, className: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600', onClick: () => navigate('/billing/new', { state: { clientId: client.id } }) }
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className={`flex-1 flex items-center justify-center gap-3 py-4 border rounded-lg font-bold text-sm transition-all font-open-sans shadow-sm active:scale-[0.98] ${action.className}`}
              >
                <action.icon size={18} /> {action.label}
              </button>
            ))}
          </div>












          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto hide-scrollbar sticky top-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md z-10 -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 sm:px-8 py-4 sm:py-5 text-sm font-bold transition-all relative font-open-sans whitespace-nowrap ${isActive ? 'text-black dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon size={16} />
                    {tab.label}
                  </div>
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-blue-500" />}
                </button>
              );
            })}
          </div>

          {/* Tab Content area */}
          <div className="animate-in fade-in duration-500">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                
                {/* Contact Information Card */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[30px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
                  <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-black dark:text-white text-sm flex items-center gap-3 font-open-sans">
                    <User size={18} /> Contact Information
                  </div>
                  <div className="p-10 space-y-8">
                    {[
                      { label: 'Email', value: client.email, icon: Mail },
                      { label: 'Phone', value: client.phone || 'N/A', icon: Phone },
                      { label: 'Company', value: client.company || 'Private Client', icon: Building2 },
                      { label: 'Location', value: client.country || 'Global Site', icon: MapPin },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-black dark:text-white shrink-0">
                          <item.icon size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 font-open-sans">{item.label}</p>
                          <p className="text-base font-bold text-black dark:text-white font-open-sans">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Projects Card */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[30px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
                  <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-black dark:text-white text-sm flex items-center gap-3 font-open-sans">
                    <Briefcase size={18} /> Recent Projects
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clientProjects.slice(0, 4).map(p => {
                      const statusTheme = p.status === 'active'
                        ? { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', bar: 'bg-blue-500', percent: 55 }
                        : p.status === 'completed'
                          ? { label: 'Completed', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', percent: 100 }
                          : p.status === 'on_hold'
                            ? { label: 'On Hold', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500', percent: 30 }
                            : { label: p.status || 'Pending', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/10', bar: 'bg-slate-400', percent: 10 };
                      return (
                        <div key={p.id} className="px-8 py-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-base font-bold text-black dark:text-white font-open-sans">{p.title}</p>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${statusTheme.bg} ${statusTheme.color} font-open-sans`}>{statusTheme.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${statusTheme.bar} rounded-full transition-all duration-1000`} style={{ width: `${statusTheme.percent}%` }}></div>
                            </div>
                            <span className={`text-[10px] font-black ${statusTheme.color} font-open-sans`}>{statusTheme.percent}%</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-open-sans">
                            {formatDate(p.deadline)} • {formatCurrency(p.totalBudget)}
                          </p>
                        </div>
                      );
                    })}
                    {clientProjects.length === 0 && (
                      <div className="p-10 text-center italic text-slate-400 font-open-sans">No project history logged.</div>
                    )}
                  </div>
                </div>

                {/* Recent Invoices Card */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[30px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
                  <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-black dark:text-white text-sm flex items-center gap-3 font-open-sans">
                    <CreditCard size={18} /> Recent Invoices
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clientDocs.slice(0, 4).map(doc => (
                      <div key={doc.id} className="px-8 py-6 flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-black dark:text-white font-open-sans">{doc.docNumber}</p>
                          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 font-open-sans">Issued {formatDate(doc.createdAt)}</p>
                        </div>
                        <p className={`text-base font-bold font-open-sans ${doc.status === 'paid' ? 'text-black dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {formatCurrency(doc.total)} • <span className="capitalize">{doc.status}</span>
                        </p>
                      </div>
                    ))}
                    {clientDocs.length === 0 && (
                      <div className="p-10 text-center italic text-slate-400 font-open-sans">No invoice history logged.</div>
                    )}
                  </div>
                </div>

                {/* Revenue History (Replacing Fiscal Performance Track) */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[30px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
                  <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-black dark:text-white text-sm flex items-center gap-3 font-open-sans">
                    <TrendingUp size={18} /> Revenue History
                  </div>
                  <div className="p-10 h-64 flex items-end justify-between gap-4">
                    {[40, 70, 45, 90, 65, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-4">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm transition-all hover:bg-black dark:hover:bg-blue-600" style={{ height: `${h}%` }} />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-open-sans">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>


              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black dark:text-white font-open-sans">Active Projects</h3>
                  <button onClick={() => navigate('/projects', { state: { clientId: client.id } })} className="px-8 py-3 bg-black dark:bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 font-open-sans">
                    <Plus size={18} /> New Project
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {clientProjects.map(p => {
                    const statusTheme = p.status === 'active'
                      ? { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-200 dark:border-blue-800 hover:border-blue-400', bar: 'bg-blue-500', accent: 'bg-blue-500', percent: 55 }
                      : p.status === 'completed'
                        ? { label: 'Completed', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400', bar: 'bg-emerald-500', accent: 'bg-emerald-500', percent: 100 }
                        : p.status === 'on_hold'
                          ? { label: 'On Hold', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-200 dark:border-amber-800 hover:border-amber-400', bar: 'bg-amber-500', accent: 'bg-amber-500', percent: 30 }
                          : { label: p.status || 'Pending', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-200 dark:border-slate-800 hover:border-slate-400', bar: 'bg-slate-400', accent: 'bg-slate-400', percent: 10 };
                    return (
                      <div key={p.id} className={`bg-white dark:bg-slate-900 rounded-2xl border ${statusTheme.border} p-8 shadow-sm transition-all cursor-pointer group relative overflow-hidden`}>
                        {/* Top accent bar */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${statusTheme.accent}`}></div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-black dark:text-white group-hover:underline font-open-sans">{p.title}</h4>
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full ${statusTheme.bg} ${statusTheme.color} font-open-sans`}>{statusTheme.label}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic mb-6 font-open-sans opacity-70 leading-relaxed">"{p.description || 'No description provided.'}"</p>

                        {/* Progress bar */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-slate-400 font-open-sans">Progress</span>
                            <span className={`text-[11px] font-black ${statusTheme.color} font-open-sans`}>{statusTheme.percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${statusTheme.bar} rounded-full transition-all duration-1000`} style={{ width: `${statusTheme.percent}%` }}></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 font-open-sans">Budget</p>
                            <p className="text-base font-bold text-black dark:text-white font-open-sans">{formatCurrency(p.totalBudget)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 font-open-sans">Deadline</p>
                            <p className="text-base font-bold text-slate-700 dark:text-slate-300 font-open-sans">{formatDate(p.deadline)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black dark:text-white font-open-sans">Invoice History</h3>
                  <button onClick={() => navigate('/billing/new', { state: { clientId: client.id } })} className="px-8 py-3 bg-black dark:bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 font-open-sans">
                    <Plus size={18} /> New Invoice
                  </button>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-400 dark:border-slate-800 overflow-x-auto shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-400 dark:border-slate-700">
                        <th className="px-8 py-6 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500   tracking-widest font-open-sans">Identifier</th>
                        <th className="px-8 py-6 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500   tracking-widest font-open-sans">Date</th>
                        <th className="px-8 py-6 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500   tracking-widest font-open-sans">Value</th>
                        <th className="px-8 py-6 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500   tracking-widest font-open-sans">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-400">
                      {clientDocs.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                          <td className="px-8 py-6 font-bold text-black dark:text-white font-open-sans">{doc.docNumber}</td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-500 dark:text-slate-400 font-open-sans">{formatDate(doc.createdAt)}</td>
                          <td className="px-8 py-6 text-base font-bold text-black dark:text-white font-open-sans">{formatCurrency(doc.total)}</td>
                          <td className="px-8 py-6">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-black dark:text-white   font-open-sans">{doc.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="max-w-4xl mx-auto py-10">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-8 sm:p-12">
                  <div className="space-y-12 relative">
                    <div className="absolute left-[23px] top-6 bottom-8 w-px bg-slate-200 dark:bg-slate-800" />
                    {activityTimeline.map((act) => (
                      <div key={act.id} className="relative flex items-start gap-10 group">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 text-black dark:text-white">
                          <act.icon size={20} />
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-base font-bold text-black dark:text-white font-open-sans">{act.title}</h4>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 font-open-sans">
                              {formatDate(act.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-black dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-100 dark:border-slate-800 font-open-sans">
                            "{act.description}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-right-8 duration-500">
                <h3 className="text-xl font-bold text-black dark:text-white mb-8 font-open-sans">Client Notes</h3>
                {client.notes && (
                  <div className="p-10 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg italic text-black dark:text-slate-400 text-lg leading-relaxed font-open-sans">
                    "{client.notes}"
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-4 gap-6 animate-in slide-in-from-right-8 duration-500">
                {['Master_Services_Agreement.pdf', 'Q4_Financial_Brief.xlsx', 'Identity_Asset_Kit.zip'].map((doc, i) => (
                  <div key={i} className="bg-white p-10 rounded-lg border border-slate-200 shadow-sm hover:border-black transition-all cursor-pointer flex flex-col items-center group">
                    <Paperclip className="mb-6 text-slate-400 group-hover:text-black transition-all" size={32} />
                    <p className="text-sm font-bold text-black text-center truncate w-full font-open-sans">{doc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Edit Client Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white flex justify-between font-open-sans">
              Client Details
              <button onClick={() => setIsEditing(false)}><X size={18} className="text-slate-400 dark:text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Full Name *</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:focus:ring-blue-500 text-sm font-bold text-slate-900 dark:text-white font-open-sans" placeholder="Enter identification" />
                {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 font-open-sans">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Email Address</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:focus:ring-blue-500 text-sm font-bold text-slate-900 dark:text-white font-open-sans" placeholder="e.g. name@company.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Company Organization</label>
                  <input type="text" value={editForm.company} onChange={e => setEditForm({ ...editForm, company: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:focus:ring-blue-500 text-sm font-bold text-slate-900 dark:text-white font-open-sans" placeholder="Business name" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Country Code</label>
                  <input type="text" value={editForm.countryCode} onChange={e => setEditForm({ ...editForm, countryCode: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:focus:ring-blue-500 text-sm font-bold text-slate-900 dark:text-white font-open-sans" placeholder="+1" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Phone Number</label>
                  <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:focus:ring-blue-500 text-sm font-bold text-slate-900 dark:text-white font-open-sans" placeholder="Contact number" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Country / Territory</label>
                  <select
                    value={editForm.country}
                    onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:focus:ring-blue-500 text-sm font-bold text-slate-900 dark:text-white font-open-sans appearance-none"
                  >
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Client Status</label>
                  <select
                    value={editForm.status || 'new'}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:focus:ring-blue-500 text-sm font-bold text-slate-900 dark:text-white font-open-sans appearance-none"
                  >
                    <option value="new">New</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-open-sans">Client Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:focus:ring-blue-500 text-sm font-bold text-slate-900 dark:text-white font-open-sans h-32 resize-none"
                  placeholder="Enter notes about this client..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-500 dark:text-slate-400 font-bold text-[13px] font-open-sans hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Discard</button>
                <button onClick={handleUpdate} className="px-10 py-4 bg-black dark:bg-blue-600 text-white rounded-xl font-bold text-[13px] shadow-xl font-open-sans hover:bg-slate-900 dark:hover:bg-blue-700 transition-all active:scale-95">Update Client</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-[40px] w-full max-w-md p-10 shadow-2xl text-center border border-slate-200 dark:border-slate-800">
            <Trash size={48} className="mx-auto mb-6 text-rose-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-open-sans">Terminate?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 italic font-open-sans">"Confirmation will permanently purge this account from the operational archive."</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-xl font-open-sans hover:bg-rose-700 transition-all active:scale-95">Permanently Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-4 text-slate-500 dark:text-slate-400 font-bold text-sm font-open-sans hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">Keep Client</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[300] bg-slate-50 dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-indigo-100 dark:border-slate-800 flex items-center gap-4">
          {toast.type === 'success' ? <CheckCircle className="text-emerald-500" /> : <Zap className="text-indigo-600 dark:text-blue-400" />}
          <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight font-open-sans">{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
