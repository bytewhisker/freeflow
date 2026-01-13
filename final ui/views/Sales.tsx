
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
  CheckSquare,
  Square
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

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

  // Auto-apply "Recently Created" filter when navigating from form
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'recent') {
      setFilterTime('RECENT');
      // Clear the URL parameter after applying the filter
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, setFilterTime]);

  // Selection management
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
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
  };

  // Show/hide bulk actions toolbar
  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  // Helper functions for time filtering
  const isToday = (dateString: string) => {
    const docDate = new Date(dateString);
    const today = new Date();
    return docDate.toDateString() === today.toDateString();
  };

  const isThisWeek = (dateString: string) => {
    const docDate = new Date(dateString);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
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
      const client = state.clients.find(c => c.id === doc.clientId);
      const matchesSearch = client?.name.toLowerCase().includes(search.toLowerCase()) || 
                            doc.docNumber.toLowerCase().includes(search.toLowerCase());
      
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

  const handleDelete = (id: string) => {
    if (confirm('Permanently delete this record?')) {
      setState((prev: AppState) => ({
        ...prev,
        salesDocuments: prev.salesDocuments.filter(d => d.id !== id)
      }));
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoice Management</h1>
          <p className="text-slate-500">Create and manage professional invoices for your business.</p>
        </div>
        <Link to="/billing/new" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          <Plus size={18} />
          Create New Document
        </Link>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search documents or clients..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer font-semibold text-slate-600"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="ALL">All Invoices</option>
          <option value="INVOICE">Invoices Only</option>
        </select>
        <select 
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer font-semibold text-slate-600"
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

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: 'All Time', count: state.salesDocuments.length },
          { key: 'RECENT', label: 'Recently Created', count: state.salesDocuments.filter(doc => isRecent(doc.createdAt)).length },
          { key: 'TODAY', label: 'Today', count: state.salesDocuments.filter(doc => isToday(doc.createdAt)).length },
          { key: 'THIS_WEEK', label: 'This Week', count: state.salesDocuments.filter(doc => isThisWeek(doc.createdAt)).length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterTime(key as TimeFilter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filterTime === key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Bulk Actions Toolbar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-blue-900">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedItems([])}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-800">Update Status:</span>
            {(['draft', 'sent', 'paid', 'overdue'] as DocStatus[]).map(status => (
              <button
                key={status}
                onClick={() => handleBulkStatusUpdate(status)}
                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all capitalize"
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center justify-center w-5 h-5 hover:bg-slate-200 rounded transition-colors"
                >
                  {selectedItems.length === filteredDocs.length && filteredDocs.length > 0 ? (
                    <CheckSquare size={16} className="text-blue-600" />
                  ) : (
                    <Square size={16} className="text-slate-400" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4">Doc No</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Issue Date</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
              const client = state.clients.find(c => c.id === doc.clientId);
              return (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSelectItem(doc.id)}
                      className="flex items-center justify-center w-5 h-5 hover:bg-slate-100 rounded transition-colors"
                    >
                      {selectedItems.includes(doc.id) ? (
                        <CheckSquare size={16} className="text-blue-600" />
                      ) : (
                        <Square size={16} className="text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-900">{doc.docNumber}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-slate-900">{client?.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{client?.company}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatDate(doc.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatDate(doc.dueDate)}</td>
                  <td className="px-6 py-4 font-black text-sm text-slate-900">{formatCurrency(doc.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">

                      <Link to={`/billing/view/${doc.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye size={18} />
                      </Link>
                      <Link to={`/billing/edit/${doc.id}`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Edit3 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={9} className="px-6 py-20 text-center text-slate-400 font-medium">
                  No billing records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Billing;
