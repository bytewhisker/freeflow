import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, Client } from '../types';
import { generateId, formatDate, formatCurrency } from '../utils';
import ClientDetail from './ClientDetail';
import {
  Plus,
  Search,
  Mail,
  Building2,
  Trash2,
  Phone,
  X,
  Briefcase,
  Receipt,
  Users,
  Filter,
  ChevronDown,
  Eye,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  UserCheck,
  MessageSquare,
  Download,
  Edit3,
  MoreHorizontal,
  AlertCircle,
  TrendingUp,
  Target,
  Clock,
  Edit,
  Zap,
  CheckCircle
} from 'lucide-react';

const Clients: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '', email: '', phone: '', countryCode: '+1', company: '', country: '',
    notes: '', socialMedia: {}
  });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    pendingInvoices: false,
    highRevenue: false,
    active: false,
    atRisk: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'phone' | 'revenue' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [bulkActionDropdown, setBulkActionDropdown] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // All country phone codes (A–Z)
  const countryCodes = [
    { code: '+93', country: 'Afghanistan' },
    { code: '+355', country: 'Albania' },
    { code: '+213', country: 'Algeria' },
    { code: '+376', country: 'Andorra' },
    { code: '+244', country: 'Angola' },
    { code: '+54', country: 'Argentina' },
    { code: '+374', country: 'Armenia' },
    { code: '+61', country: 'Australia' },
    { code: '+43', country: 'Austria' },
    { code: '+994', country: 'Azerbaijan' },

    { code: '+973', country: 'Bahrain' },
    { code: '+880', country: 'Bangladesh' },
    { code: '+375', country: 'Belarus' },
    { code: '+32', country: 'Belgium' },
    { code: '+501', country: 'Belize' },
    { code: '+229', country: 'Benin' },
    { code: '+975', country: 'Bhutan' },
    { code: '+591', country: 'Bolivia' },
    { code: '+387', country: 'Bosnia and Herzegovina' },
    { code: '+267', country: 'Botswana' },
    { code: '+55', country: 'Brazil' },
    { code: '+359', country: 'Bulgaria' },

    { code: '+855', country: 'Cambodia' },
    { code: '+237', country: 'Cameroon' },
    { code: '+1', country: 'Canada' },
    { code: '+238', country: 'Cape Verde' },
    { code: '+56', country: 'Chile' },
    { code: '+86', country: 'China' },
    { code: '+57', country: 'Colombia' },
    { code: '+269', country: 'Comoros' },
    { code: '+506', country: 'Costa Rica' },
    { code: '+385', country: 'Croatia' },
    { code: '+53', country: 'Cuba' },
    { code: '+357', country: 'Cyprus' },
    { code: '+420', country: 'Czech Republic' },

    { code: '+45', country: 'Denmark' },
    { code: '+253', country: 'Djibouti' },
    { code: '+1', country: 'Dominican Republic' },

    { code: '+593', country: 'Ecuador' },
    { code: '+20', country: 'Egypt' },
    { code: '+503', country: 'El Salvador' },
    { code: '+291', country: 'Eritrea' },
    { code: '+372', country: 'Estonia' },
    { code: '+251', country: 'Ethiopia' },

    { code: '+358', country: 'Finland' },
    { code: '+33', country: 'France' },

    { code: '+995', country: 'Georgia' },
    { code: '+49', country: 'Germany' },
    { code: '+233', country: 'Ghana' },
    { code: '+30', country: 'Greece' },
    { code: '+502', country: 'Guatemala' },

    { code: '+852', country: 'Hong Kong' },
    { code: '+36', country: 'Hungary' },

    { code: '+91', country: 'India' },
    { code: '+62', country: 'Indonesia' },
    { code: '+98', country: 'Iran' },
    { code: '+964', country: 'Iraq' },
    { code: '+353', country: 'Ireland' },
    { code: '+972', country: 'Israel' },
    { code: '+39', country: 'Italy' },

    { code: '+81', country: 'Japan' },
    { code: '+962', country: 'Jordan' },

    { code: '+7', country: 'Kazakhstan' },
    { code: '+254', country: 'Kenya' },
    { code: '+965', country: 'Kuwait' },
    { code: '+996', country: 'Kyrgyzstan' },

    { code: '+856', country: 'Laos' },
    { code: '+371', country: 'Latvia' },
    { code: '+961', country: 'Lebanon' },
    { code: '+218', country: 'Libya' },
    { code: '+423', country: 'Liechtenstein' },
    { code: '+370', country: 'Lithuania' },
    { code: '+352', country: 'Luxembourg' },

    { code: '+853', country: 'Macau' },
    { code: '+60', country: 'Malaysia' },
    { code: '+960', country: 'Maldives' },
    { code: '+52', country: 'Mexico' },
    { code: '+373', country: 'Moldova' },
    { code: '+976', country: 'Mongolia' },
    { code: '+212', country: 'Morocco' },

    { code: '+95', country: 'Myanmar' },

    { code: '+977', country: 'Nepal' },
    { code: '+31', country: 'Netherlands' },
    { code: '+64', country: 'New Zealand' },
    { code: '+234', country: 'Nigeria' },
    { code: '+47', country: 'Norway' },

    { code: '+968', country: 'Oman' },

    { code: '+92', country: 'Pakistan' },
    { code: '+507', country: 'Panama' },
    { code: '+51', country: 'Peru' },
    { code: '+63', country: 'Philippines' },
    { code: '+48', country: 'Poland' },
    { code: '+351', country: 'Portugal' },

    { code: '+974', country: 'Qatar' },

    { code: '+40', country: 'Romania' },
    { code: '+7', country: 'Russia' },

    { code: '+966', country: 'Saudi Arabia' },
    { code: '+221', country: 'Senegal' },
    { code: '+65', country: 'Singapore' },
    { code: '+421', country: 'Slovakia' },
    { code: '+386', country: 'Slovenia' },
    { code: '+27', country: 'South Africa' },
    { code: '+82', country: 'South Korea' },
    { code: '+34', country: 'Spain' },
    { code: '+94', country: 'Sri Lanka' },
    { code: '+46', country: 'Sweden' },
    { code: '+41', country: 'Switzerland' },
    { code: '+971', country: 'United Arab Emirates' },
    { code: '+44', country: 'United Kingdom' },
    { code: '+1', country: 'United States' },
    { code: '+598', country: 'Uruguay' },
    { code: '+998', country: 'Uzbekistan' },

  ];


  // Countries list (A-Z)
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium',
    'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark', 'Egypt',
    'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'India', 'Indonesia', 'Ireland',
    'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico', 'Netherlands', 'New Zealand',
    'Nigeria', 'Norway', 'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Russia',
    'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland',
    'Thailand', 'Turkey', 'UAE', 'UK', 'USA', 'Vietnam'
  ].sort();

  // Close bulk dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bulkActionDropdown && !(event.target as Element).closest('.bulk-action-dropdown')) {
        setBulkActionDropdown(false);
      }
    };

    if (bulkActionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [bulkActionDropdown]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdown && !(event.target as Element).closest('.status-dropdown-overlay')) {
        setStatusDropdown(null);
      }
    };

    if (statusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [statusDropdown]);

  const getClientStats = useCallback((clientId: string) => {
    const clientProjects = state.projects.filter(p => p.clientId === clientId);
    const clientDocs = state.salesDocuments.filter(d => d.clientId === clientId);

    const activeProjects = clientProjects.filter(p => p.status === 'active');
    const totalProjects = clientProjects.length;

    const paidInvoices = clientDocs.filter(d => d.type === 'INVOICE' && d.status === 'paid');
    const pendingInvoices = clientDocs.filter(d => d.type === 'INVOICE' && (d.status === 'sent' || d.status === 'overdue'));
    const overdueInvoices = clientDocs.filter(d => d.type === 'INVOICE' && d.status === 'overdue');

    const totalRevenue = paidInvoices.reduce((sum, d) => sum + d.total, 0);
    const pendingAmount = pendingInvoices.reduce((sum, d) => sum + d.total, 0);

    return {
      activeProjects: activeProjects.length,
      totalProjects,
      totalRevenue,
      pendingAmount,
      overdueCount: overdueInvoices.length,
      hasOverdue: overdueInvoices.length > 0
    };
  }, [state.projects, state.salesDocuments]);

  const filteredClients = useMemo(() => {
    let clients = state.clients.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.pendingInvoices) {
      clients = clients.filter(client => getClientStats(client.id).pendingAmount > 0);
    }

    if (filters.highRevenue) {
      clients = clients.filter(client => getClientStats(client.id).totalRevenue > 1000);
    }

    if (filters.active) {
      clients = clients.filter(client => getClientStats(client.id).activeProjects > 0);
    }

    if (filters.atRisk) {
      clients = clients.filter(client => getClientStats(client.id).healthScore < 50 || getClientStats(client.id).hasOverdue);
    }

    return clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.clients, state.projects, state.salesDocuments, search, filters, getClientStats]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, currentPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(new Set(paginatedClients.map(c => c.id)));
    } else {
      setSelectedClients(new Set());
    }
  };

  const handleSelectClient = (clientId: string, checked: boolean) => {
    const newSelected = new Set(selectedClients);
    if (checked) newSelected.add(clientId);
    else newSelected.delete(clientId);
    setSelectedClients(newSelected);
  };

  const handleStatusChange = (clientId: string, newStatus: string) => {
    setState((prev: AppState) => ({
      ...prev,
      clients: prev.clients.map(c => c.id === clientId ? { ...c, status: newStatus } : c)
    }));
    setStatusDropdown(null);
  };

  const statusOptions = [
    { value: 'new', label: 'New', color: '#9CA3AF' },
    { value: 'active', label: 'Active', color: '#10B981' },
    { value: 'inactive', label: 'Inactive', color: '#6B7280' },
    { value: 'on_hold', label: 'On Hold', color: '#F59E0B' },
    { value: 'archived', label: 'Archived', color: '#374151' },
    { value: 'vip', label: 'VIP', color: '#8B5CF6' }
  ];

  const getStatusColor = (status: string) => {
    const isDark = document.documentElement.classList.contains('dark');
    switch (status.toLowerCase()) {
      case 'new': return { bg: isDark ? '#1e293b' : '#F3F4F6', text: isDark ? '#94a3b8' : '#6B7280', border: isDark ? '#334155' : '#E5E7EB' };
      case 'active': return { bg: isDark ? '#064e3b' : '#ECFDF5', text: isDark ? '#34d399' : '#166534', border: isDark ? '#065f46' : '#BBF7D0' };
      case 'on_hold': return { bg: isDark ? '#78350f' : '#FEF3C7', text: isDark ? '#fbbf24' : '#92400E', border: isDark ? '#92400e' : '#FDE68A' };
      case 'archived': return { bg: isDark ? '#1e293b' : '#F1F5F9', text: isDark ? '#94a3b8' : '#475569', border: isDark ? '#334155' : '#E2E8F0' };
      case 'vip': return { bg: isDark ? '#1e3a8a' : '#E0F2FE', text: isDark ? '#60a5fa' : '#0E7490', border: isDark ? '#1e40af' : '#B3E5FC' };
      default: return { bg: isDark ? '#1e293b' : '#F3F4F6', text: isDark ? '#94a3b8' : '#374151', border: isDark ? '#334155' : '#E5E7EB' };
    }
  };

  const globalStats = useMemo(() => ({
    totalClients: state.clients.length,
    activeProjects: state.projects.filter(p => p.status === 'active').length,
    pendingInvoices: state.salesDocuments.filter(d => d.type === 'INVOICE' && (d.status === 'sent' || d.status === 'overdue')).length,
    monthlyRevenue: state.salesDocuments.filter(d => d.type === 'INVOICE' && d.status === 'paid').reduce((sum, d) => sum + d.total, 0)
  }), [state]);

  const validateClient = (client: Partial<Client>): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    if (!client.name?.trim()) errors.name = 'Name is required';
    if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) errors.email = 'Valid email is required';
    return errors;
  };

  const handleAdd = () => {
    const validationErrors = validateClient(newClient);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const client: Client = {
      ...newClient as Client,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setState((prev: AppState) => ({ ...prev, clients: [...prev.clients, client] }));
    setNewClient({
      name: '', email: '', phone: '', countryCode: '+1', company: '', country: '',
      notes: '', socialMedia: {}
    });
    setShowAdd(false);
    setToast({ message: 'Client added successfully', type: 'success' });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const clientToDelete = state.clients.find(c => c.id === id);
    if (clientToDelete) {
      setShowDeleteConfirm({ id, name: clientToDelete.name });
    }
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;
    const { id } = showDeleteConfirm;
    setState((prev: AppState) => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== id),
      projects: prev.projects.filter(p => p.clientId !== id),
      salesDocuments: prev.salesDocuments.filter(d => d.clientId !== id)
    }));
    setShowDeleteConfirm(null);
    setToast({ message: 'Client and associated records deleted', type: 'success' });
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
      countryCode: client.countryCode || '+1',
      company: client.company || '',
      country: client.country || '',
      notes: client.notes || '',
      socialMedia: client.socialMedia || {}
    });
    setErrors({});
  };

  const handleUpdate = () => {
    if (!editingClient) return;
    const validationErrors = validateClient(newClient);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setState((prev: AppState) => ({
      ...prev,
      clients: prev.clients.map(c => c.id === editingClient.id ? { ...c, ...newClient } : c)
    }));
    setEditingClient(null);
    setNewClient({
      name: '', email: '', phone: '', countryCode: '+1', company: '', country: '',
      notes: '', socialMedia: {}
    });
    setToast({ message: 'Client details updated', type: 'success' });
  };

  // Bulk actions
  const handleBulkStatusChange = (newStatus: string) => {
    setState((prev: AppState) => ({
      ...prev,
      clients: prev.clients.map(c =>
        selectedClients.has(c.id) ? { ...c, status: newStatus } : c
      )
    }));
    setBulkActionDropdown(false);
    setSelectedClients(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedClients.size === 0) return;
    // For bulk delete, we can also use a custom confirm or keep simple for now
    if (confirm(`Delete ${selectedClients.size} selected clients and all their associated records?`)) {
      setState((prev: AppState) => ({
        ...prev,
        clients: prev.clients.filter(c => !selectedClients.has(c.id)),
        projects: prev.projects.filter(p => !selectedClients.has(p.clientId)),
        salesDocuments: prev.salesDocuments.filter(d => !selectedClients.has(d.clientId))
      }));
      setSelectedClients(new Set());
      setToast({ message: `${selectedClients.size} clients deleted successfully`, type: 'success' });
    }
    setBulkActionDropdown(false);
  };

  return (
    <div className="min-h-screen m-0 p-4 sm:p-2 pt-4 bg-slate-50 dark:bg-slate-950 flex flex-col" >
      <div className="w-full mx-auto px-0 flex flex-col flex-1" style={{ maxWidth: '1600px' }}>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-6 mb-2 gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white whitespace-nowrap">Client Management</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto flex-1 lg:max-w-2xl">
            <div className="relative w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-hidden="true"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Search clients..."
                aria-label="Search clients"
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all font-open-sans"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* <button
                onClick={() => {
                  const reportData = state.clients.map(c => {
                    const s = getClientStats(c.id);
                    return `${c.name},${c.company},${s.totalRevenue},${s.pendingAmount},${c.status || 'new'}`;
                  }).join('\n');
                  const blob = new Blob([`Name,Company,Total Revenue,Pending Amount,Status\n${reportData}`], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `client_report_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  setToast({ message: 'Comprehensive client report exported', type: 'success' });
                }}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[13px] rounded-xl font-bold hover:bg-white dark:hover:bg-slate-900 transition-all font-open-sans h-[42px] whitespace-nowrap"
              >
                <Download size={16} />
                <span>Export Report</span>
              </button> */}

              <button
                onClick={() => setShowAdd(true)}
                aria-label="Add new client"
                className="flex items-center gap-3 px-6 py-2.5 bg-slate-900 dark:bg-blue-600 text-white text-[13px] rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 h-[42px] whitespace-nowrap"
              >
                <Plus size={15} aria-hidden="true" />
                <span>Add Client</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
          <div className="rounded-2xl p-5 text-white shadow-sm bg-white border border-slate-300 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide mb-1">Total Clients</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-open-sans">{globalStats.totalClients}</div>
              </div>
              <div className="bg-slate-900 dark:bg-white/10 p-3 rounded-xl"><Users size={24} className="text-white" /></div>
            </div>
            <div className="mt-1 flex items-center gap-2"><div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full"></div><span className="text-sm text-slate-600 dark:text-slate-300 font-medium">All active clients</span></div>
          </div>
          <div className="rounded-2xl p-5 text-white shadow-sm bg-white border border-slate-300 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide mb-2">Active Projects</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-open-sans">{globalStats.activeProjects}</div>
              </div>
              <div className="bg-slate-900 dark:bg-white/10 p-3 rounded-xl"><Briefcase size={24} className="text-white" /></div>
            </div>
            <div className="mt-1 flex items-center gap-2"><div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full"></div><span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Currently in progress</span></div>
          </div>
          <div className="rounded-2xl p-5 text-white shadow-sm bg-white border border-slate-300 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide mb-2">Pending Invoices</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-open-sans">{globalStats.pendingInvoices}</div>
              </div>
              <div className="bg-slate-900 dark:bg-white/10 p-3 rounded-xl"><AlertCircle size={24} className="text-white" /></div>
            </div>
            <div className="mt-1 flex items-center gap-2"><div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full"></div><span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Awaiting payment</span></div>
          </div>
        </div>



        <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
          {/* Sticky Bulk Action Bar */}
          {selectedClients.size > 0 && (
            <div className="sticky top-0 z-30 bg-blue-600 px-6 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-white">
                  {selectedClients.size} selected
                </span>
                <button
                  onClick={() => setSelectedClients(new Set())}
                  className="text-xs text-blue-200 hover:text-white transition-colors"
                  aria-label="Clear selection"
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative bulk-action-dropdown">
                  <button
                    onClick={() => setBulkActionDropdown(!bulkActionDropdown)}
                    aria-haspopup="true"
                    aria-expanded={bulkActionDropdown}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
                  >
                    <Filter size={16} aria-hidden="true" />
                    Bulk Actions
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                  {bulkActionDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right z-50">
                      <div className="p-1.5 bg-slate-50/50">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 font-open-sans">
                          Change Status
                        </div>
                        {statusOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleBulkStatusChange(option.value)}
                            className="w-full text-left px-4 py-2.5 text-[11px] font-bold tracking-tight rounded-xl hover:bg-white hover:shadow-sm transition-all flex items-center gap-2"
                            style={{ color: option.color }}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} aria-hidden="true"></div>
                            {option.label}
                          </button>
                        ))}
                        <div className="my-2 border-t border-slate-200"></div>
                        <button
                          onClick={handleBulkDelete}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold tracking-tight rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center gap-2 text-rose-600"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}






          <div className={`bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 px-6 py-4 ${selectedClients.size > 0 ? 'border-t border-t-black dark:border-t-blue-500' : ''}`}>
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Client Directory</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">({filteredClients.length})</span>
              </div>

            </div>
          </div>






          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 font-open-sans">Quick Filters:</div>
              {[
                { k: 'pendingInvoices', l: 'Pending', i: Clock, c: 'amber', label: 'Filter by pending invoices' },
                { k: 'active', l: 'Active', i: Target, c: 'green', label: 'Filter by active projects' },
                { k: 'highRevenue', l: 'High Revenue', i: TrendingUp, c: 'blue', label: 'Filter by high revenue' },
                { k: 'atRisk', l: 'At Risk', i: AlertCircle, c: 'rose', label: 'Filter by at-risk clients' }
              ].map(f => (
                <button
                  key={f.k}
                  onClick={() => setFilters(prev => {
                    const isAlreadyActive = (prev as any)[f.k];
                    return {
                      pendingInvoices: false,
                      highRevenue: false,
                      active: false,
                      atRisk: false,
                      [f.k]: !isAlreadyActive
                    };
                  })}
                  aria-pressed={filters[f.k as keyof typeof filters]}
                  aria-label={f.label}
                  className={`px-4 py-1.5 rounded-full font-bold text-[11px] transition-all duration-200 border ${filters[f.k as keyof typeof filters]
                    ? `bg-${f.c}-500 text-white border-${f.c}-500 shadow-md`
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <f.i size={12} />
                    <span>{filters[f.k as keyof typeof filters] ? `✓ ${f.l}` : f.l}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-blue-400/20 rounded-[32px] animate-ping duration-[3000ms]"></div>
                  <Users size={40} className="text-blue-600 relative z-10" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-open-sans">No Client Connections</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-10 leading-relaxed font-medium font-open-sans text-sm">
                  {search || filters.pendingInvoices || filters.highRevenue || filters.active
                    ? 'No clients matches your current filter criteria. Refine your search to explore other relations.'
                    : 'Your client directory is currently empty. Start building your network by onboarding your first entry.'}
                </p>

                {search || filters.pendingInvoices || filters.highRevenue || filters.active ? (
                  <button
                    onClick={() => {
                      setSearch('');
                      setFilters({ pendingInvoices: false, highRevenue: false, active: false });
                    }}
                    className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-[13px] shadow-lg hover:bg-black transition-all active:scale-95 font-open-sans"
                  >
                    Clear Filter Criteria
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAdd(true)}
                    className="px-10 py-5 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl hover:bg-slate-900 transition-all active:scale-95 flex items-center gap-3 font-open-sans"
                  >
                    <Plus size={20} />
                    Onboard First Client
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full relative text-center min-w-[1000px] border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-20">
                  <tr>
                    <th className="px-5 py-4 text-left w-12 border-b border-slate-200 dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={paginatedClients.length > 0 && paginatedClients.every(c => selectedClients.has(c.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Select all clients on this page"
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      />
                    </th>
                    <th className="px-5 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300 font-open-sans tracking-tight border-b border-slate-200 dark:border-slate-700">Client</th>
                    <th className="px-5 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300 font-open-sans tracking-tight border-b border-slate-200 dark:border-slate-700">Contact</th>
                    <th className="px-5 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300 font-open-sans tracking-tight border-b border-slate-200 dark:border-slate-700">Phone</th>
                    <th className="px-5 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300 font-open-sans tracking-tight border-b border-slate-200 dark:border-slate-700">Total Billed</th>
                    <th className="px-5 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300 font-open-sans tracking-tight border-b border-slate-200 dark:border-slate-700">Outstanding</th>
                    <th className="px-5 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300 font-open-sans tracking-tight border-b border-slate-200 dark:border-slate-700">Status</th>
                    <th className="px-5 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300 font-open-sans tracking-tight w-32 border-b border-slate-200 dark:border-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
                  {paginatedClients.map((client) => {
                    const stats = getClientStats(client.id);
                    const statusInfo = getStatusColor(client.status || 'new');
                    const isDropdownOpen = statusDropdown === client.id;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-pointer group"
                        style={{ height: '50px' }}
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedClients.has(client.id)}
                            onChange={(e) => handleSelectClient(client.id, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${client.name}`}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-2 ">
                          <div className="flex items-center justify-center gap-3  ">

                            <div className="text-center">
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">{client.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{client.email}</div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{client.countryCode || ''} {client.phone}</div>
                        </td>
                        <td className="px-4 py-2 text-center font-semibold text-slate-900 dark:text-slate-300">{formatCurrency(stats.totalRevenue)}</td>
                        <td className="px-4 py-2 text-center font-semibold text-amber-600 dark:text-amber-500">{formatCurrency(stats.pendingAmount)}</td>
                        <td className="px-4 py-2 text-center">
                          <div className={`relative status-dropdown-overlay ${isDropdownOpen ? 'z-50' : 'z-10'}`}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setStatusDropdown(isDropdownOpen ? null : client.id); }}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  setStatusDropdown(null);
                                }
                              }}
                              aria-haspopup="true"
                              aria-expanded={isDropdownOpen}
                              aria-label={`Change status for ${client.name}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              style={{ backgroundColor: statusInfo.bg, color: statusInfo.text, borderColor: statusInfo.border }}
                            >
                              {client.status || 'New'}
                              <ChevronDown size={10} strokeWidth={3} aria-hidden="true" />
                            </button>

                            {isDropdownOpen && (
                              <div
                                className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                                role="menu"
                                aria-orientation="vertical"
                              >
                                <div className="p-1.5 bg-slate-50/50 dark:bg-slate-900/50">
                                  {statusOptions.map((option, index) => (
                                    <button
                                      key={option.value}
                                      onClick={(e) => { e.stopPropagation(); handleStatusChange(client.id, option.value); }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'ArrowDown') {
                                          e.preventDefault();
                                          const nextOption = statusOptions[index + 1];
                                          if (nextOption) {
                                            const nextButton = document.activeElement?.nextSibling as HTMLElement;
                                            nextButton?.focus();
                                          }
                                        } else if (e.key === 'ArrowUp') {
                                          e.preventDefault();
                                          const prevOption = statusOptions[index - 1];
                                          if (prevOption) {
                                            const prevButton = document.activeElement?.previousSibling as HTMLElement;
                                            prevButton?.focus();
                                          }
                                        }
                                      }}
                                      role="menuitem"
                                      tabIndex={0}
                                      className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      style={{ color: option.value === (client.status || 'new') ? option.color : (document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b') }}
                                    >
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} aria-hidden="true"></div>
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}
                              aria-label={`View details for ${client.name}`}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              onClick={(e) => { e.stopPropagation(); handleEditClient(client); }}
                              aria-label={`Edit ${client.name}`}
                            >
                              <Edit3 size={16} aria-hidden="true" />
                            </button>
                            <button
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              onClick={(e) => { e.stopPropagation(); handleDelete(client.id, e); }}
                              aria-label={`Delete ${client.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border-t dark:border-slate-800 px-6 py-4 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-bold text-slate-400 dark:text-slate-500 font-open-sans">
              Showing {filteredClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-2">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                aria-label="Next page"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-lg shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-7 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white">Edit Client</h2>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Modify existing client information</p>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
              <div className="space-y-1.5">
                <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Full Name </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all text-sm font-semibold font-open-sans placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white ${errors.name ? 'border-rose-100 dark:border-rose-900/50 bg-rose-50/30' : 'border-transparent focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10'}`}
                  placeholder="e.g. John Doe"
                />
                {errors.name && <p className="text-rose-500 text-[15px] font-bold mt-1.5 ml-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Email Address</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                    className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all text-sm font-semibold font-open-sans placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white ${errors.email ? 'border-rose-100 dark:border-rose-900/50 bg-rose-50/30' : 'border-transparent focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10'}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-rose-500 text-[15px] font-bold mt-1.5 ml-1">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Organization</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Phone Number</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Territory</label>
                  <div className="relative">
                    <select
                      value={newClient.country}
                      onChange={e => setNewClient({ ...newClient, country: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans appearance-none cursor-pointer text-slate-900 dark:text-white"
                    >
                      <option value="" className="dark:bg-slate-900">Select territory</option>
                      {countries.map(c => (
                        <option key={c} value={c} className="dark:bg-slate-900">{c}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Status</label>
                  <div className="relative">
                    <select
                      value={newClient.status || 'new'}
                      onChange={e => setNewClient({ ...newClient, status: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans appearance-none cursor-pointer text-slate-900 dark:text-white"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="dark:bg-slate-900">{opt.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Internal Notes</label>
                <textarea
                  value={newClient.notes}
                  onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans h-32 resize-none placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white"
                  placeholder="Record observations or project history..."
                />
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-4 bg-slate-50/30 dark:bg-slate-800/30">
              <button
                onClick={() => setEditingClient(null)}
                className="px-6 py-3.5 text-slate-500 dark:text-slate-400 font-bold font-open-sans text-[13px] hover:text-slate-800 dark:hover:text-white transition-colors rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-bold font-open-sans text-[13px] shadow-lg hover:shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-lg shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-7 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white">Add New Client</h2>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Onboard a new client to your directory</p>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
              <div className="space-y-1.5">
                <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Full Name </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all text-sm font-semibold font-open-sans placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white ${errors.name ? 'border-rose-100 dark:border-rose-900/50 bg-rose-50/30' : 'border-transparent focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10'}`}
                  placeholder="e.g. John Doe"
                />
                {errors.name && <p className="text-rose-500 text-[15px] font-bold mt-1.5 ml-1 animate-in slide-in-from-top-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Email Address</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                    className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all text-sm font-semibold font-open-sans placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white ${errors.email ? 'border-rose-100 dark:border-rose-900/50 bg-rose-50/30' : 'border-transparent focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10'}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-rose-500 text-[15px] font-bold mt-1.5 ml-1 animate-in slide-in-from-top-1">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Organization</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Country</label>
                  <div className="relative">
                    <select
                      value={newClient.country}
                      onChange={e => setNewClient({ ...newClient, country: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans appearance-none cursor-pointer text-slate-900 dark:text-white"
                    >
                      <option value="" className="dark:bg-slate-900">Select territory</option>
                      {countries.map(c => (
                        <option key={c} value={c} className="dark:bg-slate-900">{c}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Initial Status</label>
                  <div className="relative">
                    <select
                      value={newClient.status || 'new'}
                      onChange={e => setNewClient({ ...newClient, status: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans appearance-none cursor-pointer text-slate-900 dark:text-white"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="dark:bg-slate-900">{opt.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[15px] font-bold text-black dark:text-slate-300 font-open-sans ml-1">Internal Notes</label>
                <textarea
                  value={newClient.notes}
                  onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl outline-none transition-all focus:border-blue-500/20 dark:focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 text-sm font-semibold font-open-sans h-32 resize-none placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white"
                  placeholder="Record observations or project history..."
                />
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-4 bg-slate-50/30 dark:bg-slate-800/30">
              <button
                onClick={() => setShowAdd(false)}
                className="px-6 py-3.5 text-slate-500 dark:text-slate-400 font-bold font-open-sans text-[13px] hover:text-slate-800 dark:hover:text-white transition-colors rounded-xl"
              >
                Discard
              </button>
              <button
                onClick={handleAdd}
                className="px-10 py-3.5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold font-open-sans text-[13px] shadow-lg hover:shadow-blue-500/10 hover:bg-black dark:hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus size={16} />
                Create Client
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md p-10 shadow-2xl border border-transparent dark:border-slate-800 animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Delete Client?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10">
              This will permanently delete <span className="font-bold text-slate-900 dark:text-white">"{showDeleteConfirm.name}"</span> and all associated
              projects and invoices. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold font-open-sans text-sm hover:bg-rose-700 transition-all hover:shadow-xl active:scale-95"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold font-open-sans text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
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
          <div className={`px-10 py-5 rounded-[24px] shadow-2xl flex items-center gap-5 border backdrop-blur-2xl ${toast.type === 'success' ? 'bg-emerald-900/95 border-emerald-400/20 text-white' :
            toast.type === 'error' ? 'bg-rose-900/95 border-rose-400/20 text-white' :
              'bg-slate-900/95 border-white/10 text-white'
            }`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' :
              toast.type === 'error' ? 'bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]' :
                'bg-white/10'
              }`}>
              {toast.type === 'success' ? <CheckCircle size={22} className="text-emerald-400" /> :
                toast.type === 'info' ? <Zap size={22} className="text-blue-400" /> :
                  <AlertCircle size={22} className="text-rose-400" />}
            </div>
            <p className="text-sm font-bold font-open-sans tracking-tight leading-none whitespace-nowrap">
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
