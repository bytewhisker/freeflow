import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, Client } from '../types';
import { formatCurrency, formatRelativeTime, COUNTRY_CODES } from '../utils';
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
  Edit
} from 'lucide-react';

const Clients: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '', email: '', phone: '', countryCode: '+1', company: '', country: '',
    notes: '', socialMedia: {}
  });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    pendingInvoices: false,
    highRevenue: false,
    active: false
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

  // Helper function to get country flag by code
  const getCountryFlag = (countryCode: string) => {
    const country = COUNTRY_CODES.find(c => c.code === countryCode);
    return country ? country.flag : '';
  };

  const countries = COUNTRY_CODES.map(c => c.country).sort();

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
    switch (status.toLowerCase()) {
      case 'new': return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
      case 'active': return { bg: '#ECFDF5', text: '#166534', border: '#BBF7D0' };
      case 'on_hold': return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'archived': return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
      case 'vip': return { bg: '#E0F2FE', text: '#0E7490', border: '#B3E5FC' };
      default: return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
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
    if (!client.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) errors.email = 'Valid email is required';
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
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete client and all associated records?')) {
      setState((prev: AppState) => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== id),
        projects: prev.projects.filter(p => p.clientId !== id),
        salesDocuments: prev.salesDocuments.filter(d => d.clientId !== id)
      }));
    }
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
    if (confirm(`Delete ${selectedClients.size} selected clients and all their associated records?`)) {
      setState((prev: AppState) => ({
        ...prev,
        clients: prev.clients.filter(c => !selectedClients.has(c.id)),
        projects: prev.projects.filter(p => !selectedClients.has(p.clientId)),
        salesDocuments: prev.salesDocuments.filter(d => !selectedClients.has(d.clientId))
      }));
      setSelectedClients(new Set());
    }
    setBulkActionDropdown(false);
  };

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full mx-auto px-6 h-full flex flex-col" style={{ maxWidth: '1600px' }}>

        <div className="flex justify-between items-center py-6 mb-2" style={{ height: '25px' }}>
          <div className="flex items-center gap-4">
            {/* <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users size={24} className="text-white" />
            </div> */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Client Management</h1>
              {/* <p className="text-slate-600">Premium client relationship dashboard</p> */}
            </div>
          </div>



          <button
            onClick={() => setShowAdd(true)}
            aria-label="Add new client"
            className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[13px] rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Add Client</span>
          </button>



        </div>

        <div className="grid grid-cols-3 gap-6 mb-5" style={{ height: '140px' }}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-blue-100 uppercase tracking-wide mb-1">Total Clients</div>
                <div className="text-3xl font-bold">{globalStats.totalClients}</div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl"><Users size={24} /></div>
            </div>
            <div className="mt-1 flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full"></div><span className="text-sm text-blue-100">All active clients</span></div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-green-100 uppercase tracking-wide mb-2">Active Projects</div>
                <div className="text-3xl font-bold">{globalStats.activeProjects}</div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl"><Briefcase size={24} /></div>
            </div>
            <div className="mt-1 flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full"></div><span className="text-sm text-green-100">Currently in progress</span></div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-amber-100 uppercase tracking-wide mb-2">Pending Invoices</div>
                <div className="text-3xl font-bold">{globalStats.pendingInvoices}</div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl"><AlertCircle size={24} /></div>
            </div>
            <div className="mt-1 flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full"></div><span className="text-sm text-amber-100">Awaiting payment</span></div>
          </div>
        </div>



        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 40px)' }}>
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
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase  ">
                          Change Status
                        </div>
                        {statusOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleBulkStatusChange(option.value)}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white hover:shadow-sm transition-all flex items-center gap-2"
                            style={{ color: option.color }}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} aria-hidden="true"></div>
                            {option.label}
                          </button>
                        ))}
                        <div className="my-2 border-t border-slate-200"></div>
                        <button
                          onClick={handleBulkDelete}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center gap-2 text-rose-600"
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

          <div className={`bg-slate-50 border-b border-slate-200 px-6 py-4 ${selectedClients.size > 0 ? 'border-t' : ''}`} style={{ height: '50px' }}>
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Client Directory</h2>
                <span className="text-sm text-slate-500 font-medium">({filteredClients.length})</span>
              </div>
              {selectedClients.size === 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Select clients to perform bulk actions</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6" style={{ height: '70px' }}>
            <div className="flex items-center justify-between h-full">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"><Search size={20} /></div>
                <input
                  type="text"
                  placeholder="Search clients..."
                  aria-label="Search clients"
                  className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 ml-6">
                {[
                  { k: 'pendingInvoices', l: 'Pending', i: Clock, c: 'amber', label: 'Filter by pending invoices' },
                  { k: 'active', l: 'Active', i: Target, c: 'green', label: 'Filter by active projects' },
                  { k: 'highRevenue', l: 'High Revenue', i: TrendingUp, c: 'blue', label: 'Filter by high revenue' }
                ].map(f => (
                  <button
                    key={f.k}
                    onClick={() => setFilters(prev => ({ ...prev, [f.k]: !prev[f.k] }))}
                    aria-pressed={filters[f.k as keyof typeof filters]}
                    aria-label={f.label}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${filters[f.k as keyof typeof filters] ? `bg-${f.c}-500 text-white shadow-lg` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <f.i size={16} />
                      <span>{filters[f.k as keyof typeof filters] ? `✓ ${f.l}` : f.l}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '200px' }}>
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[150px] py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Users size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No clients found</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {search || filters.pendingInvoices || filters.highRevenue || filters.active
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first client'}
                </p>
                {(search || filters.pendingInvoices || filters.highRevenue || filters.active) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setFilters({ pendingInvoices: false, highRevenue: false, active: false });
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Clear all filters"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full relative">
                <thead className="bg-slate-50 sticky top-0 z-20">
                  <tr>
                    <th className="px-5 py-4 text-left w-12">
                      <input
                        type="checkbox"
                        checked={paginatedClients.length > 0 && paginatedClients.every(c => selectedClients.has(c.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Select all clients on this page"
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Total Billed</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Outstanding</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedClients.map((client) => {
                    const stats = getClientStats(client.id);
                    const statusInfo = getStatusColor(client.status || 'new');
                    const isDropdownOpen = statusDropdown === client.id;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
                        style={{ height: '56px' }}
                        onClick={() => setSelectedClientId(client.id)}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedClients.has(client.id)}
                            onChange={(e) => handleSelectClient(client.id, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${client.name}`}
                            className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm" aria-hidden="true">{client.name[0]}</div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 leading-tight">{client.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-xs font-medium text-slate-600">{client.email}</div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-xs font-medium text-slate-600">
                            {getCountryFlag(client.countryCode || '+1')} {client.countryCode || ''} {client.phone}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-900">{formatCurrency(stats.totalRevenue)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-amber-600">{formatCurrency(stats.pendingAmount)}</td>
                        <td className="px-4 py-2">
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
                                className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                                role="menu"
                                aria-orientation="vertical"
                              >
                                <div className="p-1.5 bg-slate-50/50">
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
                                      className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white hover:shadow-sm transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      style={{ color: option.value === (client.status || 'new') ? option.color : '#64748b' }}
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
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              onClick={(e) => { e.stopPropagation(); setSelectedClientId(client.id); }}
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

        <div className="bg-white border-t border-slate-200 px-6 py-4 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ height: '64px' }}>
          <div className="flex justify-between items-center h-full">
            <div className="text-xs font-bold text-slate-400 uppercase  ">
              Showing {filteredClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className="text-xs font-bold text-slate-400 uppercase   px-2">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                aria-label="Next page"
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Client Detail Slide-in Panel */}
      {selectedClientId && (
        <ClientDetail
          state={state}
          setState={setState}
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
        />
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Client</h2>
              <button onClick={() => setEditingClient(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.name ? 'border-red-300' : 'border-slate-300'}`}
                  placeholder="Enter client name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.email ? 'border-red-300' : 'border-slate-300'}`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Country Code</label>
                  <select
                    value={newClient.countryCode}
                    onChange={e => setNewClient({ ...newClient, countryCode: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {COUNTRY_CODES.map(cc => (
                      <option key={cc.code} value={cc.code}>{cc.flag} {cc.code}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                <select
                  value={newClient.country}
                  onChange={e => setNewClient({ ...newClient, country: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  value={newClient.notes}
                  onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                  placeholder="Add notes about this client"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingClient(null)}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add New Client</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.name ? 'border-red-300' : 'border-slate-300'}`}
                  placeholder="Enter client name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.email ? 'border-red-300' : 'border-slate-300'}`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Country Code</label>
                  <select
                    value={newClient.countryCode}
                    onChange={e => setNewClient({ ...newClient, countryCode: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {COUNTRY_CODES.map(cc => (
                      <option key={cc.code} value={cc.code}>{cc.flag} {cc.code}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                <select
                  value={newClient.country}
                  onChange={e => setNewClient({ ...newClient, country: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  value={newClient.notes}
                  onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                  placeholder="Add notes about this client"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
