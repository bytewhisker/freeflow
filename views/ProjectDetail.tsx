import React from 'react';
import { AppState } from '../types';
import { formatDate, formatCurrency, getStatusColor, getRemainingTime } from '../utils';
import {
  ArrowLeft,
  Briefcase,
  Users,
  Receipt,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Edit3,
  X
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface ProjectDetailProps {
  state: AppState;
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ state, projectId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const project = state.projects.find(p => p.id === projectId);

  if (!isOpen || !projectId) return null;

  if (!project) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white roboto-font">Project not found</h2>
          <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold roboto-font">Close</button>
        </div>
      </div>
    );
  }

  const client = state.clients.find(c => c.id === project.clientId);
  const invoices = state.salesDocuments.filter(d => d.projectId === projectId);
  const currencyCode = state.settings.currency.code;

  const earned = invoices
    .filter(d => d.type === 'INVOICE' && d.status === 'paid')
    .reduce((sum, d) => sum + d.total, 0);

  const pending = invoices
    .filter(d => d.type === 'INVOICE' && (d.status === 'sent' || d.status === 'overdue'))
    .reduce((sum, d) => sum + d.total, 0);


  const remaining = project.deadline ? getRemainingTime(project.deadline) : null;
  const isUrgent = remaining?.urgency === 'urgent' || remaining?.text === 'Overdue';

  const handleEdit = () => {
    onClose();
    navigate('/projects', { state: { editProjectId: project.id } });
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-950 shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none h-full flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-300 dark:border-slate-800">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 roboto-font">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-widest rounded-md">
                  Project Detail
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`}></span>
              </div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {project.title || 'Untitled Project'}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Users size={12} className="text-indigo-500" /> Client
              </p>
              <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                {client?.company || client?.name || 'Private Entity'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Briefcase size={12} className="text-blue-500" /> Status
              </p>
              <p className="text-[13px] font-bold text-slate-900 dark:text-white uppercase truncate">
                {project.status.replace('_', ' ')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <DollarSign size={12} className="text-emerald-500" /> Budget
              </p>
              <p className="text-base font-black text-slate-900 dark:text-white">
                {formatCurrency(project.totalBudget, currencyCode)}
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border shadow-sm ${isUrgent ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/50' : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-800'}`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <AlertCircle size={12} className={isUrgent ? 'text-rose-500' : 'text-slate-400'} /> Deadline
              </p>
              <p className={`text-[13px] font-bold ${isUrgent ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                {remaining ? remaining.text : 'Open'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center gap-2">
              <FileText size={14} className="text-blue-500" />
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Description</h2>
            </div>
            {project.description && (
              <div className="p-4 text-slate-600 dark:text-slate-400 leading-relaxed text-[13px] font-medium italic">
                {project.description}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/40">
              <div className="flex items-center gap-2">
                <Receipt size={14} className="text-indigo-500" />
                <h2 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Invoices & Documents</h2>
              </div>
              <Link
                to="/billing/new"
                className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition"
                onClick={onClose}
              >
                New
              </Link>
            </div>

            <div className="p-2 space-y-1.5">
              {invoices.length ? invoices.map(doc => (
                <Link
                  key={doc.id}
                  to={`/billing/view/${doc.id}`}
                  className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-50 dark:border-slate-800/50 bg-white dark:bg-slate-950 hover:border-blue-500/30 transition-all duration-300"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[8px] ${doc.type === 'INVOICE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-50 text-slate-500 dark:bg-slate-800'}`}>
                      {doc.type === 'INVOICE' ? 'INV' : 'QT'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors text-[12px] uppercase truncate max-w-[100px]">{doc.docNumber}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{formatDate(doc.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-black text-slate-900 dark:text-white">
                      {formatCurrency(doc.total, currencyCode)}
                    </p>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-6 opacity-40">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No documents</p>
                </div>
              )}
            </div>
          </div>

          {/* Financials Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-500" />
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white">Overview</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Paid</p>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(earned, currencyCode)}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending</p>
                  <p className="text-base font-black text-rose-600 dark:text-rose-400">{formatCurrency(pending, currencyCode)}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Revenue Status</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{project.totalBudget ? Math.round((earned / project.totalBudget) * 100) : 0}%</p>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${project.totalBudget ? Math.min(100, Math.round((earned / project.totalBudget) * 100)) : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Padding for scroll */}
          <div className="h-4"></div>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleEdit}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl roboto-font font-bold text-[16px] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            Edit Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
