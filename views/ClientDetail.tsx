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
    { id: 'activity', label: 'Activity', icon: Activity }
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Client not found</h2>
          <button onClick={handleClose} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`w-full bg-white flex flex-col p-4 md:p-6 lg:p-8 min-h-screen`}
      >
        <div className="flex flex-col">
          <div className="mb-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)' }}
                  >
                    {client.name[0]}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{client.name}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase   shadow-sm"
                        style={{ backgroundColor: clientStatusColor.bg, color: clientStatusColor.text, border: `1px solid ${clientStatusColor.border}` }}
                      >
                        {client.status || 'New'}
                      </span>
                      <span className="text-slate-400 text-[10px] font-bold">• Joined {formatDate(client.createdAt || new Date().toISOString())}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl">
                  <button
                    onClick={() => {
                      setToast({ message: 'Initializing Invoice Builder...', type: 'info' });
                      setTimeout(() => navigate('/billing/new', { state: { clientId: client.id } }), 500);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase   hover:bg-emerald-700 transition-all hover:shadow-lg active:scale-95 shadow-md shadow-emerald-100"
                  >
                    <Plus size={14} /> New Invoice
                  </button>
                  <button
                    onClick={() => {
                      setToast({ message: 'Opening Project Creator...', type: 'info' });
                      setTimeout(() => navigate('/projects', { state: { clientId: client.id } }), 500);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase   hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95 shadow-md shadow-blue-100"
                  >
                    <Plus size={14} /> New Project
                  </button>
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase   hover:bg-purple-700 transition-all hover:shadow-lg active:scale-95 shadow-md shadow-purple-100"
                  >
                    <Send size={14} /> Message
                  </a>
                </div>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button
                  onClick={handleEdit}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                  title="Edit Client"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete Client"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Billed', value: formatCurrency(animatedStats.totalRevenue), color: 'emerald', icon: DollarSign },
                { label: 'Outstanding', value: formatCurrency(animatedStats.pendingAmount), color: stats.pendingAmount > 0 ? 'amber' : 'slate', icon: Clock },
                { label: 'Active Projects', value: animatedStats.activeProjects, color: 'blue', icon: Briefcase },
                {
                  label: 'Health Score',
                  value: `${stats.healthScore}%`,
                  color: 'purple',
                  icon: Zap,
                  tooltip: stats.healthScore === 0 ? 'NO RECENT ACTIVITY' : `${stats.healthScore}% of possible performance`
                }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden">
                  {stat.label === 'Health Score' && stats.healthScore === 0 && (
                    <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-slate-50 rotate-45 group-hover:bg-slate-100 transition-colors"></div>
                  )}
                  <div className="flex items-center justify-between mb-1 relative z-10">
                    <p className="text-[9px] font-black text-slate-400 uppercase  ">{stat.label}</p>
                    <div className={`p-1.5 rounded-lg ${stat.label === 'Health Score' && stats.healthScore === 0
                      ? 'bg-slate-100 text-slate-400'
                      : `bg-${stat.color}-50 text-${stat.color}-500`
                      } group-hover:scale-110 transition-transform`}>
                      <stat.icon size={12} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <p className={`text-xl font-black text-slate-900 tracking-tight ${stat.label === 'Health Score' && stats.healthScore === 0 ? 'text-slate-300' : ''}`}>
                      {stat.value}
                    </p>
                    {stat.tooltip && (
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${stat.label === 'Health Score' && stats.healthScore === 0 ? 'text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded' : 'text-slate-400'
                        }`}>
                        {stat.tooltip}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 flex-1">
            {/* Sidebar Navigation */}
            <div className="w-52 flex flex-col gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-500 hover:bg-slate-100'
                      }`}
                  >
                    <Icon size={14} />
                    <span className="font-black text-[10px] uppercase  ">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0">
              <div className="bg-slate-50/50 rounded-[32px] p-6 border border-slate-100 space-y-4">
                {activeTab === 'overview' && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-[32px] p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-50">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Contact Information</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                            <div className="flex items-start gap-3.5">
                              <div className="p-2 rounded-2xl bg-blue-50 text-blue-500">
                                <Mail size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase   mb-0.5">Email Address</p>
                                <p className="text-[13px] font-bold text-slate-900 truncate">{client.email}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3.5">
                              <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-500">
                                <Phone size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase   mb-0.5">Phone Number</p>
                                <p className="text-[13px] font-bold text-slate-900">{client.countryCode || ''} {client.phone || 'Not provided'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3.5">
                              <div className="p-2 rounded-2xl bg-purple-50 text-purple-500">
                                <Building2 size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase   mb-0.5">Company / Org</p>
                                <p className="text-[13px] font-bold text-slate-900">{client.company || 'Private Client'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3.5">
                              <div className="p-2 rounded-2xl bg-amber-50 text-amber-500">
                                <MapPin size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase   mb-0.5">Location</p>
                                <p className="text-[13px] font-bold text-slate-900">{client.country || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {client.notes && (
                          <div className="bg-white rounded-[32px] p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Internal Client Notes</h3>
                            <p className="text-[13px] text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-6 py-2 bg-slate-50/30 rounded-r-2xl">
                              "{client.notes}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-5 space-y-4">
                        {/* Activity Preview */}
                        <div className="bg-white rounded-[32px] p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Recent Activity</h3>
                            <button onClick={() => setActiveTab('activity')} className="text-[10px] font-black uppercase   text-blue-600 hover:text-blue-700">View All</button>
                          </div>
                          <div className="space-y-3">
                            {activityTimeline.length === 0 ? (
                              <p className="text-[11px] text-slate-400 py-4 text-center italic">No recent activity logged</p>
                            ) : (
                              activityTimeline.slice(0, 3).map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                  <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                                    <activity.icon size={13} style={{ color: activity.color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <p className="text-[12px] font-bold text-slate-900">{activity.title}</p>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{formatRelativeTime(activity.timestamp)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate">{activity.description}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Projects Preview */}
                        <div className="bg-white rounded-[32px] p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Active Projects</h3>
                            <button onClick={() => setActiveTab('projects')} className="text-[10px] font-black uppercase   text-blue-600 hover:text-blue-700">View All</button>
                          </div>
                          <div className="space-y-2.5">
                            {clientProjects.filter(p => p.status === 'active').slice(0, 3).map(project => (
                              <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-white hover:border-blue-100 border border-transparent rounded-2xl transition-all shadow-sm group/project">
                                <div className="min-w-0">
                                  <p className="font-bold text-[12px] text-slate-900 truncate group-hover/project:text-blue-600 transition-colors">{project.title}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase   mt-0.5">{formatCurrency(project.totalBudget)}</p>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm group-hover/project:translate-x-1 transition-transform">
                                  <ChevronRight size={14} className="text-slate-300" />
                                </div>
                              </div>
                            ))}
                            {clientProjects.filter(p => p.status === 'active').length === 0 && (
                              <div className="text-center py-6 bg-slate-50/30 rounded-3xl border border-dashed border-slate-100">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                                  <Plus size={18} className="text-slate-200" />
                                </div>
                                <p className="text-[9px] font-black text-slate-300 uppercase  ">No active projects</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM WHITESPACE FILLER: Engagement & Financial Trend */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50/50">
                        <div>
                          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <TrendingUp size={14} className="text-blue-600" />
                            Relationship Performance
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Growth metrics and relationship health over the last 6 months</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl">
                          <button className="px-4 py-1.5 rounded-xl bg-white shadow-sm text-[10px] font-black uppercase text-slate-900 transition-all">Revenue</button>
                          <button className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all">Projects</button>
                        </div>
                      </div>

                      <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {[40, 65, 45, 90, 75, 100].map((height, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                            <div className="w-full relative flex items-end justify-center">
                              <div
                                className="w-full rounded-2xl transition-all duration-1000 group-hover:brightness-110 shadow-lg shadow-blue-50/50"
                                style={{
                                  height: `${height}%`,
                                  background: height > 80
                                    ? 'linear-gradient(to top, #3B82F6, #60A5FA)'
                                    : 'linear-gradient(to top, #E2E8F0, #F1F5F9)'
                                }}
                              ></div>
                              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 duration-300">
                                {formatCurrency((height * 125))}
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase  ">
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp size={20} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase  ">Growth</p>
                            <p className="text-base font-black text-slate-900">+24.8%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase  ">Retention</p>
                            <p className="text-base font-black text-slate-900">High</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase  ">Lifetime</p>
                            <p className="text-base font-black text-slate-900">1.2 Years</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                          {clientProjects.filter(p => p.status === 'active').length} Active
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-wider">
                          {clientProjects.filter(p => p.status === 'completed').length} Completed
                        </span>
                      </div>
                      <button
                        onClick={() => navigate('/projects', { state: { clientId: client.id } })}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase   hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Plus size={12} /> New Project
                      </button>
                    </div>

                    {clientProjects.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm border-dashed">
                        <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No projects yet</h3>
                        <p className="text-xs text-slate-500 mb-4">Start your first project with this client</p>
                        <button
                          onClick={() => navigate('/projects', { state: { clientId: client.id } })}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                        >
                          <Plus size={12} /> Create Project
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {clientProjects.map(project => (
                          <div key={project.id} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{project.title}</h4>
                              <span
                                className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase  "
                                style={{
                                  backgroundColor: project.status === 'active' ? '#ECFDF5' : project.status === 'completed' ? '#E0F2FE' : '#FEF3C7',
                                  color: project.status === 'active' ? '#166534' : project.status === 'completed' ? '#0E7490' : '#92400E'
                                }}
                              >
                                {project.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3 line-clamp-1">{project.description || 'No description'}</p>
                            <div className="flex items-center justify-between text-[10px] pt-3 border-t border-slate-50">
                              <span className="flex items-center gap-1 font-bold text-slate-700">
                                <DollarSign size={10} />
                                {formatCurrency(project.totalBudget)}
                              </span>
                              <span className="flex items-center gap-1 text-slate-400 font-medium">
                                <Calendar size={10} />
                                {formatDate(project.deadline)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'invoices' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                        <p className="text-[9px] font-black text-emerald-600 uppercase   mb-1">Paid</p>
                        <p className="text-xl font-black text-emerald-700">{formatCurrency(stats.totalRevenue)}</p>
                        <p className="text-[10px] text-emerald-500 font-bold">{stats.paidInvoices} invoices</p>
                      </div>
                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 shadow-sm">
                        <p className="text-[9px] font-black text-amber-600 uppercase   mb-1">Pending</p>
                        <p className="text-xl font-black text-amber-700">{formatCurrency(stats.pendingAmount)}</p>
                        <p className="text-[10px] text-amber-500 font-bold">{stats.pendingInvoices} invoices</p>
                      </div>
                      <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 shadow-sm">
                        <p className="text-[9px] font-black text-rose-600 uppercase   mb-1">Overdue</p>
                        <p className="text-xl font-black text-rose-700">{stats.overdueCount}</p>
                        <p className="text-[10px] text-rose-500 font-bold">Action required</p>
                      </div>
                    </div>

                    {clientDocs.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm border-dashed">
                        <FileTextIcon size={32} className="text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No invoices yet</h3>
                        <p className="text-xs text-slate-500">Create your first invoice for this client</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-black text-slate-400 uppercase  ">Invoice</th>
                              <th className="px-4 py-3 text-left font-black text-slate-400 uppercase  ">Date</th>
                              <th className="px-4 py-3 text-right font-black text-slate-400 uppercase  ">Amount</th>
                              <th className="px-4 py-3 text-left font-black text-slate-400 uppercase  ">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {clientDocs.map(doc => (
                              <tr key={doc.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                <td className="px-4 py-3 font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{doc.docNumber}</td>
                                <td className="px-4 py-3 text-slate-500">{formatDate(doc.createdAt)}</td>
                                <td className="px-4 py-3 text-right font-black text-slate-900">{formatCurrency(doc.total)}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase  "
                                    style={{
                                      backgroundColor: doc.status === 'paid' ? '#ECFDF5' : doc.status === 'overdue' ? '#FEF2F2' : '#EFF6FF',
                                      color: doc.status === 'paid' ? '#166534' : doc.status === 'overdue' ? '#DC2626' : '#1E40AF'
                                    }}
                                  >
                                    {doc.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-3">
                    {activityTimeline.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm border-dashed">
                        <Activity size={32} className="text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No activity yet</h3>
                        <p className="text-xs text-slate-500">Track milestones and updates here</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {activityTimeline.map((activity) => {
                          const Icon = activity.icon;
                          return (
                            <div key={activity.id} className="bg-white rounded-xl p-3 border border-slate-100 flex items-start gap-3 shadow-sm hover:shadow-md transition-all">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: `${activity.color}10` }}
                              >
                                <Icon size={16} style={{ color: activity.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <h4 className="font-bold text-xs text-slate-900">{activity.title}</h4>
                                  <span className="text-[10px] text-slate-400 font-medium">{formatRelativeTime(activity.timestamp)}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Client Details</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="w-10 h-10 rounded-2xl hover:bg-slate-100 flex items-center justify-center transition-all hover:rotate-90"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase   mb-1.5 ml-1">Client Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold ${errors.name ? 'border-rose-200' : 'border-slate-100 focus:border-blue-500'}`}
                  placeholder="e.g. Acme Corp"
                />
                {errors.name && <p className="text-rose-500 text-[10px] font-black mt-2 ml-1 uppercase  ">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase   mb-1.5 ml-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase   mb-1.5 ml-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase   mb-1.5 ml-1">Company</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase   mb-1.5 ml-1">Country</label>
                  <select
                    value={editForm.country}
                    onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none"
                  >
                    <option value="">Select country</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase   mb-1.5 ml-1">Internal Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium resize-none"
                  rows={4}
                />
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 flex justify-end gap-4 sticky bottom-0 bg-white/80 backdrop-blur-md">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 text-slate-400 rounded-2xl font-black text-[10px] uppercase   hover:bg-slate-50 hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-12 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase   shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
              >
                Update Client
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Trash size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Delete Client?</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-10">
              This will permanently delete <span className="font-bold text-slate-900">"{client.name}"</span> and all associated
              projects and invoices. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase   hover:bg-rose-700 transition-all hover:shadow-xl active:scale-95"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase   hover:bg-slate-200 transition-all"
              >
                Keep Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-900/95 border-emerald-800/50 text-emerald-50' :
            toast.type === 'error' ? 'bg-rose-900/95 border-rose-800/50 text-rose-50' :
              'bg-slate-900/95 border-white/10 text-slate-50'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500/20' :
              toast.type === 'error' ? 'bg-rose-500/20' : 'bg-white/10'
              }`}>
              {toast.type === 'success' ? <CheckCircle size={18} className="text-emerald-400" /> :
                toast.type === 'info' ? <Zap size={18} className="text-blue-400" /> :
                  <AlertCircle size={18} className="text-rose-400" />}
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em]">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientDetail;
