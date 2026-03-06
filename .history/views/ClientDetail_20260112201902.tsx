import React, { useState, useMemo, useEffect } from 'react';
// Added imports for useParams and useNavigate to handle routing when used as a page
import { useParams, useNavigate } from 'react-router-dom';
import { AppState, Project, SalesDocument } from '../types';
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
  // Made clientId and onClose optional to fix App.tsx route error
  clientId?: string;
  onClose?: () => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ state, setState, clientId: propClientId, onClose: propOnClose }) => {
  // Extract ID from URL if prop is missing
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = propClientId || routeId || '';
  const onClose = propOnClose || (() => navigate('/clients'));

  const [activeTab, setActiveTab] = useState('overview');
  const [isHovered, setIsHovered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Get real data for this client
  const client = state.clients.find(c => c.id === clientId);
  const clientProjects: Project[] = state.projects.filter(p => p.clientId === clientId);
  const clientDocs: SalesDocument[] = state.salesDocuments.filter(d => d.clientId === clientId);

  // Animated counter for stats
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
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleDelete = () => {
    if (confirm('Delete client and all associated records?')) {
      setState((prev: AppState) => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== clientId),
        projects: prev.projects.filter(p => p.clientId !== clientId),
        salesDocuments: prev.salesDocuments.filter(d => d.clientId !== clientId)
      }));
      handleClose();
    }
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

  // Generate activity from real data
  const activityTimeline = useMemo(() => {
    const activities = [];

    // Add invoice activities
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

    // Add project activities
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

    // Sort by date descending
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{ maxWidth: '50vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} className="text-black" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)' }}
              >
                {client.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
                <p className="text-sm text-slate-500">{client.company || 'Private Client'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: clientStatusColor.bg, color: clientStatusColor.text }}
            >
              {client.status || 'New'}
            </span>
            <button className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <MoreHorizontal size={20} className="text-black" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billed</p>
              <p className="text-lg font-black text-emerald-600">{formatCurrency(animatedStats.totalRevenue)}</p>
            </div>
            <div className="w-px h-10 bg-slate-300" />
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding</p>
              <p className={`text-lg font-black ${stats.pendingAmount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {formatCurrency(animatedStats.pendingAmount)}
              </p>
            </div>
            <div className="w-px h-10 bg-slate-300" />
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projects</p>
              <p className="text-lg font-black text-blue-600">{animatedStats.activeProjects}</p>
            </div>
            <div className="w-px h-10 bg-slate-300" />
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoices</p>
              <p className="text-lg font-black text-black">{stats.totalInvoices}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${isActive
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-slate-50">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Mail size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Email</p>
                      <p className="text-slate-900 font-medium">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Phone size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Phone</p>
                      <p className="text-slate-900 font-medium">{client.countryCode || ''} {client.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Building2 size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Company</p>
                      <p className="text-slate-900 font-medium">{client.company || 'Private Client'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <MapPin size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Country</p>
                      <p className="text-slate-900 font-medium">{client.country || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Projects */}
              {clientProjects.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Recent Projects</h3>
                    <button className="text-blue-600 font-medium text-sm hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {clientProjects.slice(0, 3).map(project => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-900">{project.title}</p>
                          <p className="text-sm text-slate-500">{formatCurrency(project.totalBudget)}</p>
                        </div>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-bold uppercase"
                          style={{
                            backgroundColor: project.status === 'active' ? '#ECFDF5' : '#FEF3C7',
                            color: project.status === 'active' ? '#166534' : '#92400E'
                          }}
                        >
                          {project.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Invoices */}
              {clientDocs.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Recent Invoices</h3>
                    <button className="text-blue-600 font-medium text-sm hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {clientDocs.slice(0, 3).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-900">{doc.docNumber}</p>
                          <p className="text-sm text-slate-500">{formatDate(doc.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatCurrency(doc.total)}</p>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold uppercase"
                            style={{
                              backgroundColor: doc.status === 'paid' ? '#ECFDF5' : doc.status === 'overdue' ? '#FEF2F2' : '#EFF6FF',
                              color: doc.status === 'paid' ? '#166534' : doc.status === 'overdue' ? '#DC2626' : '#1E40AF'
                            }}
                          >
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Notes</h3>
                  <p className="text-black leading-relaxed">{client.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                    {clientProjects.filter(p => p.status === 'active').length} Active
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
                    {clientProjects.filter(p => p.status === 'completed').length} Completed
                  </span>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors">
                  <Plus size={16} />
                  New Project
                </button>
              </div>

              {clientProjects.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No projects yet</h3>
                  <p className="text-slate-500 mb-4">Start your first project with this client</p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientProjects.map(project => (
                    <div key={project.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-900">{project.title}</h4>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-bold uppercase"
                          style={{
                            backgroundColor: project.status === 'active' ? '#ECFDF5' : project.status === 'completed' ? '#E0F2FE' : '#FEF3C7',
                            color: project.status === 'active' ? '#166534' : project.status === 'completed' ? '#0E7490' : '#92400E'
                          }}
                        >
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{project.description || 'No description'}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-slate-500">
                          <DollarSign size={14} />
                          <span className="font-bold text-slate-700">{formatCurrency(project.totalBudget)}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar size={14} />
                          <span>Due {formatDate(project.deadline)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-600 uppercase">Paid</p>
                  <p className="text-xl font-black text-emerald-700">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-emerald-500">{stats.paidInvoices} invoices</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <p className="text-xs font-bold text-amber-600 uppercase">Pending</p>
                  <p className="text-xl font-black text-amber-700">{formatCurrency(stats.pendingAmount)}</p>
                  <p className="text-xs text-amber-500">{stats.pendingInvoices} invoices</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                  <p className="text-xs font-bold text-red-600 uppercase">Overdue</p>
                  <p className="text-xl font-black text-red-700">{stats.overdueCount}</p>
                  <p className="text-xs text-red-500">invoices</p>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                <Plus size={18} />
                Create Invoice
              </button>

              {clientDocs.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <FileTextIcon size={48} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No invoices yet</h3>
                  <p className="text-slate-500">Create your first invoice for this client</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Invoice</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientDocs.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50 cursor-pointer">
                          <td className="px-4 py-3 font-bold text-slate-900">{doc.docNumber}</td>
                          <td className="px-4 py-3 text-black">{formatDate(doc.createdAt)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(doc.total)}</td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-bold uppercase"
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

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activityTimeline.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <Activity size={48} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No activity yet</h3>
                  <p className="text-slate-500">Activity will appear here as you work with this client</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityTimeline.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="bg-white rounded-2xl p-4 border border-slate-200 flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${activity.color}20` }}
                        >
                          <Icon size={18} style={{ color: activity.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900">{activity.title}</h4>
                            <span className="text-xs text-slate-500">{formatRelativeTime(activity.timestamp)}</span>
                          </div>
                          <p className="text-sm text-black truncate">{activity.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {/* <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-white">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <Trash size={16} />
            Delete
          </button>
          <div className="flex items-center gap-3">

            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus size={16} />
              New Invoice
            </button>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default ClientDetail;
