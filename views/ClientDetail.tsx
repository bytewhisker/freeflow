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
    const healthScore = Math.min(100, Math.round((totalRevenue / 10000) * 50 + (activeProjects.length * 10) + (paidInvoices.length * 5)));

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
      pendingInvoices: pendingInvoices.length
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
    { id: 'notes', label: 'Notes', icon: MessageSquare },

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
          <div className="bg-white rounded-2xl p-10 text-center shadow-2xl border border-slate-200 max-w-sm w-full">
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
    <div className="w-full bg-white min-h-screen flex items-center justify-center">
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

      <div className="max-w-[3000px] w-full min-h-[900px] bg-white flex flex-col font-open-sans overflow-hidden animate-in fade-in duration-500">
        {/* Header */}
        <div className="px-2 py-2 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={handleClose} className="flex items-center gap-2 text-slate-500 hover:text-black transition-all font-bold text-sm font-open-sans">
              <ChevronLeft size={35} />
            </button>
            <div className="flex items-center gap-5">f

              <div>
                <h1 className="text-3xl font-bold text-black tracking-tight font-open-sans leading-none mb-1">{client.name}</h1>
                <p className="text-slate-500 text-sm font-bold font-open-sans">
                  Private Client • Joined {formatDate(client.createdAt || new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 rounded-full text-[11px] font-bold border border-slate-200 bg-slate-50 text-black uppercase tracking-wider font-open-sans">
              {client.status || 'Active'}
            </span>
            <button onClick={handleEdit} className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all font-open-sans flex items-center gap-2">
              <Edit3 size={16} /> Edit Client
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue + stats.pendingAmount) },
              { label: 'Outstanding', value: formatCurrency(stats.pendingAmount) },
              { label: 'Active Projects', value: stats.activeProjects },
              { label: 'Total Invoices', value: stats.totalInvoices },
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-[30px] border border-blue-100 shadow-lg text-center">
                <p className="text-[18px] font-bold text-black mb-2 font-open-sans">{stat.label}</p>
                <p className="text-3xl font-bold text-black font-open-sans">{stat.value}</p>
              </div>
            ))}
          </div>











          {/* Quick Actions */}
          <div className="flex gap-4 mb-2">
            {[
              { label: 'New Project', icon: FolderOpen, hoverClass: 'bg-blue-500 hover:bg-blue-800', onClick: () => navigate('/projects', { state: { clientId: client.id } }) },

              { label: 'Message Client', icon: Send, hoverClass: 'bg-indigo-500 hover:bg-indigo-800', onClick: () => window.location.href = `mailto:${client.email}` },
              { label: 'New Invoice', icon: FileTextIcon, hoverClass: 'bg-emerald-500 hover:bg-emerald-800', onClick: () => navigate('/billing/new', { state: { clientId: client.id } }) }
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className={`flex-1 flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-lg font-bold text-sm text-white bg-white ${action.hoverClass} hover:text-white  transition-all font-open-sans`}
              >
                <action.icon size={18} /> {action.label}
              </button>
            ))}
          </div>












          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 mb-5 overflow-x-auto hide-scrollbar  ">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-5 text-sm font-bold transition-all relative font-open-sans whitespace-nowrap ${isActive ? 'text-black' : 'text-slate-400 hover:text-black'}`}
                >
                  {tab.label}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                </button>
              );
            })}
          </div>

          {/* Tab Content area */}
          <div className="animate-in fade-in duration-500">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-10">
                {/* Contact Information Card */}
                <div className="bg-white rounded-[30px] border border-slate-200 overflow-hidden shadow-lg">
                  <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 font-bold text-black text-sm flex items-center gap-3 font-open-sans">
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
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-black shrink-0">
                          <item.icon size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-open-sans">{item.label}</p>
                          <p className="text-base font-bold text-black font-open-sans">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Projects Card - Reusing project card styling for the overview summary */}
                <div className="bg-white rounded-[30px] border border-slate-200 overflow-hidden shadow-lg">
                  <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 font-bold text-black text-sm flex items-center gap-3 font-open-sans">
                    <Briefcase size={18} /> Recent Projects
                  </div>
                  <div className="divide-y divide-slate-100">
                    {clientProjects.slice(0, 4).map(p => (
                      <div key={p.id} className="px-8 py-6 flex flex-col gap-1">
                        <p className="text-base font-bold text-black font-open-sans">{p.title}</p>
                        <p className="text-sm font-bold text-slate-400 font-open-sans capitalize">
                          {p.status} • {formatDate(p.deadline)} • {formatCurrency(p.totalBudget)}
                        </p>
                      </div>
                    ))}
                    {clientProjects.length === 0 && (
                      <div className="p-10 text-center italic text-slate-400 font-open-sans">No project history logged.</div>
                    )}
                  </div>
                </div>

                {/* Recent Invoices Card */}
                <div className="bg-white rounded-[30px] border border-slate-200 overflow-hidden shadow-lg">
                  <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 font-bold text-black text-sm flex items-center gap-3 font-open-sans">
                    <CreditCard size={18} /> Recent Invoices
                  </div>
                  <div className="divide-y divide-slate-100">
                    {clientDocs.slice(0, 4).map(doc => (
                      <div key={doc.id} className="px-8 py-6 flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-black font-open-sans">{doc.docNumber}</p>
                          <p className="text-sm font-bold text-slate-400 font-open-sans">Issued {formatDate(doc.createdAt)}</p>
                        </div>
                        <p className={`text-base font-bold font-open-sans ${doc.status === 'paid' ? 'text-black' : 'text-slate-500'}`}>
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
                <div className="bg-white rounded-[30px] border border-slate-200 overflow-hidden shadow-lg">
                  <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 font-bold text-black text-sm flex items-center gap-3 font-open-sans">
                    <TrendingUp size={18} /> Revenue History
                  </div>
                  <div className="p-10 h-64 flex items-end justify-between gap-4">
                    {[40, 70, 45, 90, 65, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-4">
                        <div className="w-full bg-slate-100 rounded-t-sm transition-all hover:bg-black" style={{ height: `${h}%` }} />
                        <span className="text-[10px] font-bold text-slate-400 font-open-sans">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client Notes (Replacing Executive Intel) */}
                <div className="bg-white rounded-[30px] border border-slate-200 overflow-hidden shadow-lg">
                  <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 font-bold text-black text-sm flex items-center gap-3 font-open-sans">
                    <MessageSquare size={18} /> Client Notes
                  </div>
                  <div className="p-10 italic text-slate-600 leading-relaxed font-open-sans">
                    {client.notes || 'No strategic observations logged for this client entity.'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black font-open-sans">Active Projects</h3>
                  <button onClick={() => navigate('/projects', { state: { clientId: client.id } })} className="px-8 py-3 bg-black text-white rounded-lg font-bold text-sm flex items-center gap-2 font-open-sans">
                    <Plus size={18} /> New Project
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  {clientProjects.map(p => (
                    <div key={p.id} className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm hover:border-black transition-all cursor-pointer group">
                      <h4 className="text-xl font-bold text-black mb-4 group-hover:underline font-open-sans">{p.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2 italic mb-8 font-open-sans italic opacity-70 leading-relaxed">"{p.description || 'Internal project intelligence not logged.'}"</p>
                      <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-open-sans">Budget</p>
                          <p className="text-base font-bold text-black font-open-sans">{formatCurrency(p.totalBudget)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-open-sans">Deadline</p>
                          <p className="text-base font-bold text-slate-700 font-open-sans">{formatDate(p.deadline)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black font-open-sans">Invoice History</h3>
                  <button onClick={() => navigate('/billing/new', { state: { clientId: client.id } })} className="px-8 py-3 bg-black text-white rounded-lg font-bold text-sm flex items-center gap-2 font-open-sans">
                    <Plus size={18} /> New Invoice
                  </button>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-8 py-6 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest font-open-sans">Identifier</th>
                        <th className="px-8 py-6 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest font-open-sans">Date</th>
                        <th className="px-8 py-6 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest font-open-sans">Value</th>
                        <th className="px-8 py-6 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest font-open-sans">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientDocs.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-all cursor-pointer">
                          <td className="px-8 py-6 font-bold text-black font-open-sans">{doc.docNumber}</td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-500 font-open-sans">{formatDate(doc.createdAt)}</td>
                          <td className="px-8 py-6 text-base font-bold text-black font-open-sans">{formatCurrency(doc.total)}</td>
                          <td className="px-8 py-6">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold border border-slate-200 bg-slate-50 text-black uppercase font-open-sans">{doc.status}</span>
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
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden p-12">
                  <div className="space-y-12 relative">
                    <div className="absolute left-[23px] top-6 bottom-8 w-px bg-slate-200" />
                    {activityTimeline.map((act) => (
                      <div key={act.id} className="relative flex items-start gap-10 group">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 bg-white z-10 text-black">
                          <act.icon size={20} />
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-base font-bold text-black font-open-sans">{act.title}</h4>
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 font-open-sans">
                              {formatDate(act.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 italic bg-slate-50/50 p-6 rounded-lg border border-slate-100 font-open-sans">
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
              <div className="bg-white p-12 rounded-lg border border-slate-200 shadow-sm animate-in slide-in-from-right-8 duration-500">
                <h3 className="text-xl font-bold text-black mb-8 font-open-sans">Client Notes</h3>
                <div className="p-10 bg-slate-50 border border-slate-100 rounded-lg italic text-slate-600 text-lg leading-relaxed font-open-sans">
                  "{client.notes || 'No strategic observations logged for this client entity.'}"
                </div>
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
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 text-[13px] font-bold text-slate-900 flex justify-between font-open-sans">
              Client Details
              <button onClick={() => setIsEditing(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-open-sans">Full Name *</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-bold font-open-sans" placeholder="Enter guest identifier" />
                {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 font-open-sans">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-open-sans">Email Address</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-bold font-open-sans" placeholder="name@company.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-open-sans">Company Entity</label>
                  <input type="text" value={editForm.company} onChange={e => setEditForm({ ...editForm, company: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-bold font-open-sans" placeholder="Organization name" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-open-sans">Code</label>
                  <input type="text" value={editForm.countryCode} onChange={e => setEditForm({ ...editForm, countryCode: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-bold font-open-sans" placeholder="+1" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-open-sans">Phone Connection</label>
                  <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-bold font-open-sans" placeholder="Number" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-open-sans">Site Location</label>
                  <select
                    value={editForm.country}
                    onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-bold font-open-sans appearance-none"
                  >
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-open-sans">Operational Status</label>
                  <select
                    value={editForm.status || 'new'}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-bold font-open-sans appearance-none"
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
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-open-sans">Strategic Observations</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-bold font-open-sans h-24 resize-none"
                  placeholder="Intelligence logged for this entity..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-500 font-bold text-[11px] uppercase font-open-sans">Abort</button>
                <button onClick={handleUpdate} className="px-8 py-3 bg-black text-white rounded-lg font-bold text-[11px] shadow-xl uppercase font-open-sans">Apply Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl text-center">
            <Trash size={48} className="mx-auto mb-6 text-rose-500" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2 font-open-sans">Terminate?</h2>
            <p className="text-sm text-slate-500 mb-10 italic font-open-sans">"Confirmation will permanently purge this account from the operational archive."</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-xs shadow-xl uppercase font-open-sans">Purge Data</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-4 text-slate-400 font-bold text-xs uppercase font-open-sans">Abort</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[300] animate-in slide-in-from-right-10 duration-500 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-indigo-100 flex items-center gap-4">
          {toast.type === 'success' ? <CheckCircle className="text-emerald-500" /> : <Zap className="text-indigo-600" />}
          <p className="text-sm font-bold text-slate-900 tracking-tight font-open-sans">{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
