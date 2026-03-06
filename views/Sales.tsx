import React, { useState, useMemo, useEffect } from 'react';
import { AppState, DocType, DocStatus } from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../utils';
import {
  Plus,
  Filter,
  Search,
  Eye,
  Edit3,
  Trash2,
  ArrowRight,
  Receipt,
  Square,
  CheckSquare,
  CheckCircle,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';

type TimeFilter = 'ALL' | 'RECENT' | 'TODAY' | 'THIS_WEEK';

const Billing: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterType, setFilterType] = useState<DocType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<DocStatus | 'ALL'>('ALL');
  const [filterTime, setFilterTime] = useState<TimeFilter>('ALL');
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const location = useLocation();

  // Auto-apply "Recently Created" filter when navigating from form
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'recent') {
      setFilterTime('RECENT');
      // Clear the URL parameter after applying the filter
      setSearchParams({});
    }

    // Check for toast in location state
    if (location.state?.toast) {
      setToast(location.state.toast);
      // Clear state to prevent toast on refresh
      window.history.replaceState({}, document.title);
    }
  }, [searchParams, setSearchParams, setFilterTime, location.state]);

  // Selection management
  const handleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItems.length === filteredDocs.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredDocs.map(doc => doc.id));
    }
  };

  const handleBulkStatusUpdate = (newStatus: DocStatus) => {
    setState((prev: AppState) => ({
      ...prev,
      salesDocuments: prev.salesDocuments.map(doc =>
        selectedItems.includes(doc.id) ? { ...doc, status: newStatus } : doc
      )
    }));
    setSelectedItems([]);
    setToast({ message: `Successfully updated ${selectedItems.length} documents`, type: 'success' });
  };

  // Show/hide bulk actions toolbar
  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  // Helper functions for time filtering
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

  const isToday = (dateString: string) => {
    const docDate = new Date(dateString);
    const today = new Date();
    return docDate.toDateString() === today.toDateString();
  };

  const isThisWeek = (dateString: string) => {
    const docDate = new Date(dateString);
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() - dayOfWeek + 6);
    return docDate >= startOfWeek && docDate <= endOfWeek;
  };

  const isRecent = (dateString: string) => {
    const docDate = new Date(dateString);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    return docDate >= oneDayAgo;
  };

  const filteredDocs = useMemo(() => {
    let filtered = state.salesDocuments.filter(doc => {
      const matchesType = filterType === 'ALL' || doc.type === filterType;
      const matchesStatus = filterStatus === 'ALL' || doc.status === filterStatus;

      const client = (state.clients || []).find(c => c.id === doc.clientId);
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch = !searchTerm ||
        (client?.name || '').toLowerCase().includes(searchTerm) ||
        (client?.company || '').toLowerCase().includes(searchTerm) ||
        (doc.docNumber || '').toLowerCase().includes(searchTerm) ||
        (doc.billTo || '').toLowerCase().includes(searchTerm) ||
        doc.total.toString().includes(searchTerm);

      // Time-based filtering
      let matchesTime = true;
      if (filterTime === 'TODAY') {
        matchesTime = isToday(doc.createdAt);
      } else if (filterTime === 'THIS_WEEK') {
        matchesTime = isThisWeek(doc.createdAt);
      } else if (filterTime === 'RECENT') {
        matchesTime = isRecent(doc.createdAt);
      }

      return matchesType && matchesStatus && matchesSearch && matchesTime;
    });

    // Sort by creation date (most recent first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state, filterType, filterStatus, filterTime, search]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(id);
  };
  // ... rest of code


  const confirmDelete = () => {
    if (showDeleteConfirm) {
      setState((prev: AppState) => ({
        ...prev,
        salesDocuments: prev.salesDocuments.filter(d => d.id !== showDeleteConfirm)
      }));
      setToast({ message: 'Document deleted successfully', type: 'info' });
      setSelectedItems(prev => prev.filter(id => id !== showDeleteConfirm));
    }
    setShowDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="space-y-6 m-0 p-4 sm:p-8 pt-4 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-open-sans">Billing & Ledger</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium font-open-sans">Monitor your financial interactions and document status.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search ref or client..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 text-sm font-medium transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/billing/new" className="w-full sm:w-auto bg-black dark:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-slate-900 dark:hover:bg-blue-700 transition-all active:scale-95 font-open-sans text-[13px] whitespace-nowrap">
            <Plus size={18} />
            Issue New Invoice
          </Link>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'ALL', label: 'All History', count: state.salesDocuments.length },
            { key: 'RECENT', label: '24h Activity', count: state.salesDocuments.filter(doc => isRecent(doc.createdAt)).length },
            { key: 'TODAY', label: 'Today', count: state.salesDocuments.filter(doc => isToday(doc.createdAt)).length },
            { key: 'THIS_WEEK', label: 'This Week', count: state.salesDocuments.filter(doc => isThisWeek(doc.createdAt)).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterTime(key as TimeFilter)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all font-open-sans shadow-sm ${filterTime === key
                ? 'bg-blue-600 text-white shadow-blue-200'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              {label} <span className={`ml-1.5 opacity-60`}>({count})</span>
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />

        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none cursor-pointer font-bold text-black dark:text-slate-300 text-[13px] font-open-sans focus:border-blue-500/20 transition-all shadow-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="ALL">All Documents</option>
            <option value="INVOICE">Invoices</option>
          </select>
          <select
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none cursor-pointer font-bold u text-black dark:text-slate-300 text-[13px] font-open-sans focus:border-blue-500/20 transition-all shadow-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="ALL">Any Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {showBulkActions && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
              <CheckSquare size={20} className="text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-white block leading-none">
                {selectedItems.length} selected
              </span>
              <button
                onClick={() => setSelectedItems([])}
                className="text-slate-400 hover:text-white text-[11px] font-bold uppercase tracking-wider mt-1 transition-colors"
              >
                Cancel Selection
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline">Update Status:</span>
            <div className="flex flex-wrap gap-2">
              {(['draft', 'sent', 'paid', 'overdue'] as DocStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => handleBulkStatusUpdate(status)}
                  className="px-4 py-2 bg-white/10 text-white border border-white/10 rounded-xl text-[12px] font-bold hover:bg-white/20 transition-all capitalize"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-300 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-[13px] roboto-font font-medium border-b border-slate-400 dark:border-slate-700">
              <th className="px-6 py-4">
                <button
                  onClick={(e) => handleSelectAll(e)}
                  className="flex items-center justify-center w-6 h-6 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {selectedItems.length === filteredDocs.length && filteredDocs.length > 0 ? (
                    <CheckSquare size={18} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square size={18} className="text-slate-300 dark:text-slate-700" />
                  )}
                </button>
              </th>
              <th className="px-6 py-5">Reference No.</th>
              <th className="px-6 py-5">Client Name</th>
              <th className="px-6 py-5 text-center">Document Type</th>
              <th className="px-6 py-5">Timeline</th>
              <th className="px-6 py-5 text-center">Created</th>
              <th className="px-6 py-5 text-center">Amount</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
            {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
              const client = state.clients.find(c => c.id === doc.clientId);
              return (
                <tr key={doc.id} className="hover:bg-blue-50/50 transition-all duration-200 group cursor-pointer" onClick={() => navigate(`/billing/view/${doc.id}`)}>
                  <td className="px-6 py-5">
                    <button
                      onClick={(e) => handleSelectItem(doc.id, e)}
                      className="flex items-center justify-center w-6 h-6 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700"
                    >
                      {selectedItems.includes(doc.id) ? (
                        <CheckSquare size={18} className="text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square size={18} className="text-slate-200 dark:text-slate-800 group-hover:text-slate-300 dark:group-hover:text-black" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-5 font-bold text-base text-slate-900 dark:text-white font-open-sans">{doc.docNumber}</td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-base text-slate-900 dark:text-white font-open-sans">{client?.name || doc.billTo?.split('\n')[0] || 'Private Client'}</p>
                    <p className="text-[13px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">{client?.company || (doc.billTo?.split('\n').length! > 1 ? doc.billTo?.split('\n')[1] : 'Individual')}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-400 font-open-sans border border-slate-200/50 dark:border-slate-700/50">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-black dark:text-slate-500  tracking-wider">Issued: {formatDate(doc.createdAt)}</span>
                      <span className="text-[13px] font-medium text-red-500 dark:text-rose-500/80  tracking-wider mt-1">Due: {formatDate(doc.dueDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 font-open-sans">
                      {getTimeAgo(doc.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <p className="font-bold text-base text-slate-900 dark:text-white font-open-sans">{formatCurrency(doc.total)}</p>
                    {doc.amountPaid > 0 && <p className="text-[12px] font-bold text-emerald-500 dark:text-emerald-400 mt-0.5">Paid: {formatCurrency(doc.amountPaid)}</p>}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-[12px] font-bold px-3 py-1 rounded-full font-open-sans uppercase tracking-wider shadow-sm ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/billing/view/${doc.id}`} onClick={(e) => e.stopPropagation()} className="p-2 text-slate-400 dark:text-black hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
                        <ArrowRight size={18} />
                      </Link>
                      <Link to={`/billing/edit/${doc.id}`} onClick={(e) => e.stopPropagation()} className="p-2 text-slate-400 dark:text-black hover:text-black dark:hover:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
                        <Edit3 size={18} />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="p-2 text-slate-400 dark:text-black hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={8} className="px-6 py-24">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 bg-slate-200/40 dark:bg-slate-700/40 rounded-[32px] animate-pulse"></div>
                      <Receipt size={40} className="text-slate-400 dark:text-slate-500 relative z-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-open-sans">No Financial Records</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-10 leading-relaxed font-medium font-open-sans">
                      "Your ledger is currently waiting for operational activity. Issue your first invoice to begin tracking revenue."
                    </p>
                    <Link
                      to="/billing/new"
                      className="inline-flex items-center gap-3 px-10 py-5 bg-black dark:bg-blue-600 text-white rounded-2xl font-bold text-[13px] shadow-2xl hover:bg-slate-900 dark:hover:bg-blue-700 transition-all active:scale-95 font-open-sans"
                    >
                      <Plus size={20} />
                      Generate First Invoice
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} className="text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Delete Document?</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">
                This action is permanent and cannot be reversed. Are you sure you want to remove this record?
              </p>
            </div>
            <div className="flex gap-4 p-8 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={cancelDelete}
                className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-open-sans"
              >
                No, Keep it
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 dark:shadow-rose-950/20 font-open-sans"
              >
                Yes, Delete
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

export default Billing;
