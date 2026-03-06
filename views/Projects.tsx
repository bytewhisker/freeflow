import React, { useState, useRef, useEffect } from 'react';
import { AppState, Project } from '../types';
import { generateId, formatDate, formatDateTime, formatCurrency, getStatusColor, getTimeUrgency } from '../utils';
import { Plus, Calendar, ChevronRight, X, Trash2, Edit3, Settings, Filter, CheckCircle, Zap, AlertCircle, Circle, RefreshCw, MoreHorizontal, Paperclip, MessageSquare, Flag, ArrowRight, Clock, Briefcase, TrendingUp, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Status } from '../types';
import ProjectDetail from './ProjectDetail';

const Projects: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const [showAdd, setShowAdd] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [projectToComplete, setProjectToComplete] = useState<Project | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  // ── Pure mouse drag state ──
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [ghostSize, setGhostSize] = useState<{ w: number; h: number }>({ w: 260, h: 180 });
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const columnRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    clientId: '',
    status: 'active',
    category: 'web_design',
    totalBudget: 0,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to 7 days from now
    description: ''
  });
  const [viewProjectId, setViewProjectId] = useState<string | null>(null);

  const currencyCode = state.settings.currency.code;

  // Categories configuration with colors
  const categories = [
    { value: 'web_design', label: 'Web Design', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    { value: 'logo_design', label: 'Logo Design', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    { value: 'video_editing', label: 'Video Editing', bgColor: 'bg-red-100', textColor: 'text-red-800' },
    { value: 'graphic_design', label: 'Graphic Design', bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
    { value: 'writing', label: 'Writing', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    { value: 'marketing', label: 'Marketing', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    { value: 'development', label: 'Development', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
    { value: 'photography', label: 'Photography', bgColor: 'bg-teal-100', textColor: 'text-teal-800' },
    { value: 'consulting', label: 'Consulting', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
    { value: 'animation', label: 'Animation', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' },
    { value: 'others', label: 'Others', bgColor: 'bg-blue-100', textColor: 'text-blue-800' }
  ];

  // Group projects into columns with search filtering
  const getProjectsByStatus = (status: Status) => {
    return state.projects
      .filter(p => {
        if (p.status !== status) return false;
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        const client = state.clients.find(c => c.id === p.clientId);
        const clientMatch = client?.company?.toLowerCase().includes(q) || client?.name?.toLowerCase().includes(q);
        const titleMatch = p.title?.toLowerCase().includes(q);
        const categoryMatch = p.category?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);

        return titleMatch || clientMatch || categoryMatch || descMatch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const columns: { id: Status; label: string; icon: React.ReactNode; color: string; accent: string; barColor: string; headerBg: string; headerBorder: string; headerText: string; headerIconBg: string; headerBadgeBg: string; headerBadgeText: string; columnBg: string; columnBorder: string; iconBg: string; badgeBg: string; badgeText: string; cardBorder: string; statusPillBg: string; statusPillText: string; statusPillBorder: string }[] = [
    { id: 'active', label: 'Pending', icon: <Circle size={18} />, color: 'text-slate-600 dark:text-slate-300', accent: 'bg-slate-400', barColor: 'bg-slate-400', headerBg: 'bg-slate-500 dark:bg-slate-700', headerBorder: '', headerText: 'text-white', headerIconBg: 'bg-white/20', headerBadgeBg: 'bg-white/20', headerBadgeText: 'text-white', columnBg: 'bg-slate-50/60 dark:bg-slate-900/30', columnBorder: 'border-slate-200/80 dark:border-slate-800', iconBg: 'bg-slate-200 dark:bg-slate-700', badgeBg: 'bg-slate-200 dark:bg-slate-700', badgeText: 'text-slate-600 dark:text-slate-300', cardBorder: 'border-l-slate-400', statusPillBg: 'bg-slate-100 dark:bg-slate-800', statusPillText: 'text-slate-600 dark:text-slate-300', statusPillBorder: 'border-slate-200 dark:border-slate-700' },
    { id: 'on_hold', label: 'In Progress', icon: <Zap size={18} />, color: 'text-amber-600 dark:text-amber-400', accent: 'bg-amber-500', barColor: 'bg-amber-500', headerBg: 'bg-amber-500 dark:bg-amber-600', headerBorder: '', headerText: 'text-white', headerIconBg: 'bg-white/20', headerBadgeBg: 'bg-white/20', headerBadgeText: 'text-white', columnBg: 'bg-amber-50/30 dark:bg-amber-950/10', columnBorder: 'border-amber-200/60 dark:border-amber-900/40', iconBg: 'bg-amber-100 dark:bg-amber-900/50', badgeBg: 'bg-amber-100 dark:bg-amber-900/40', badgeText: 'text-amber-700 dark:text-amber-300', cardBorder: 'border-l-amber-400', statusPillBg: 'bg-amber-50 dark:bg-amber-950/40', statusPillText: 'text-amber-700 dark:text-amber-300', statusPillBorder: 'border-amber-200 dark:border-amber-800' },
    { id: 'in_review', label: 'In Review', icon: <RefreshCw size={18} />, color: 'text-blue-600 dark:text-blue-400', accent: 'bg-blue-500', barColor: 'bg-blue-500', headerBg: 'bg-blue-500 dark:bg-blue-600', headerBorder: '', headerText: 'text-white', headerIconBg: 'bg-white/20', headerBadgeBg: 'bg-white/20', headerBadgeText: 'text-white', columnBg: 'bg-blue-50/30 dark:bg-blue-950/10', columnBorder: 'border-blue-200/60 dark:border-blue-900/40', iconBg: 'bg-blue-100 dark:bg-blue-900/50', badgeBg: 'bg-blue-100 dark:bg-blue-900/40', badgeText: 'text-blue-700 dark:text-blue-300', cardBorder: 'border-l-blue-400', statusPillBg: 'bg-blue-50 dark:bg-blue-950/40', statusPillText: 'text-blue-700 dark:text-blue-300', statusPillBorder: 'border-blue-200 dark:border-blue-800' },
    { id: 'completed', label: 'Completed', icon: <CheckCircle size={18} />, color: 'text-green-500 dark:text-emerald-400', accent: 'bg-emerald-500', barColor: 'bg-emerald-500', headerBg: 'bg-emerald-500 dark:bg-emerald-600', headerBorder: '', headerText: 'text-white', headerIconBg: 'bg-white/20', headerBadgeBg: 'bg-white/20', headerBadgeText: 'text-white', columnBg: 'bg-emerald-50/30 dark:bg-emerald-950/10', columnBorder: 'border-emerald-200/60 dark:border-emerald-900/40', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40', badgeText: 'text-emerald-700 dark:text-emerald-300', cardBorder: 'border-l-emerald-400', statusPillBg: 'bg-emerald-200 dark:bg-emerald-950/40', statusPillText: 'text-emerald-700 dark:text-emerald-300', statusPillBorder: 'border-emerald-200 dark:border-emerald-800' }
  ];

  const handleSubmit = () => {

    if (editingProject) {
      setState((prev: AppState) => ({
        ...prev,
        projects: prev.projects.map(p => p.id === editingProject ? { ...p, ...formData } : p)
      }));
      setToast({ message: 'Project updated successfully', type: 'success' });
    } else {
      const project: Project = {
        ...(formData as Project),
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      setState((prev: AppState) => ({ ...prev, projects: [...prev.projects, project] }));
      setToast({ message: 'Project added successfully', type: 'success' });
    }

    resetForm();
  };

  const resetForm = () => {
    setShowAdd(false);
    setEditingProject(null);
    setFormData({ title: '', clientId: '', status: 'active', category: 'web_design', totalBudget: 0, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), description: '' });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setProjectToDelete(id);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      setState((prev: AppState) => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== projectToDelete)
      }));
      setToast({ message: 'Project deleted successfully', type: 'info' });
    }
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFormData(project);
    setEditingProject(project.id);
    setShowAdd(true);
    setOpenDropdown(null);
  };

  const handleStatusChange = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setProjectToComplete(project);
    setShowCompleteModal(true);
    setOpenDropdown(null);
  };

  const confirmComplete = () => {
    if (projectToComplete) {
      const newStatus = projectToComplete.status === 'completed' ? 'active' : 'completed';
      setState((prev: AppState) => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectToComplete.id ? { ...p, status: newStatus } : p)
      }));
    }
    setShowCompleteModal(false);
    setProjectToComplete(null);
  };

  const cancelComplete = () => {
    setShowCompleteModal(false);
    setProjectToComplete(null);
  };

  const toggleDropdown = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenDropdown(openDropdown === projectId ? null : projectId);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Update current time every minute for live deadline progress
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // ── Mouse-based drag handlers ──
  const handleMouseDown = (e: React.MouseEvent, projectId: string) => {
    // Don't drag if clicking the ••• menu button
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();

    const cardEl = (e.currentTarget as HTMLElement);
    const rect = cardEl.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setGhostSize({ w: rect.width, h: rect.height });
    setDraggedProjectId(projectId);
    setGhostPos({ x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y });
  };

  useEffect(() => {
    if (!draggedProjectId) return;

    const onMove = (e: MouseEvent) => {
      setGhostPos({ x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y });

      // Detect which column is under cursor
      let found: Status | null = null;
      for (const [colId, el] of columnRefsMap.current.entries()) {
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          found = colId as Status;
          break;
        }
      }
      setDragOverColumn(found);
    };

    const onUp = (e: MouseEvent) => {
      // Find which column we're over
      let targetStatus: Status | null = null;
      for (const [colId, el] of columnRefsMap.current.entries()) {
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          targetStatus = colId as Status;
          break;
        }
      }

      if (targetStatus && draggedProjectId) {
        const project = state.projects.find(p => p.id === draggedProjectId);
        if (project && project.status !== targetStatus) {
          setState((prev: AppState) => ({
            ...prev,
            projects: prev.projects.map(p =>
              p.id === draggedProjectId
                ? { ...p, status: targetStatus!, createdAt: new Date().toISOString() }
                : p
            )
          }));
          const colLabel = columns.find(c => c.id === targetStatus)?.label || targetStatus;
          setToast({ message: `Moved to ${colLabel}`, type: 'info' });
        }
      }

      setDraggedProjectId(null);
      setDragOverColumn(null);
      setGhostPos(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggedProjectId, state.projects]);

  // Trigger progress bar animation on component mount
  React.useEffect(() => {
    const timer = setTimeout(() => setAnimateProgress(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Toast auto-hide
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Pre-fill client or handle edit if passed in navigation state
  React.useEffect(() => {
    const navState = location.state as any;
    if (navState?.clientId && !showAdd) {
      setFormData(prev => ({ ...prev, clientId: navState.clientId }));
      setShowAdd(true);
      // Clear state so it doesn't reopen on cancel
      navigate('/projects', { replace: true, state: {} });
    }
    if (navState?.editProjectId && !showAdd) {
      const project = state.projects.find(p => p.id === navState.editProjectId);
      if (project) {
        setFormData(project);
        setEditingProject(project.id);
        setShowAdd(true);
        // Clear state so it doesn't reopen on cancel
        navigate('/projects', { replace: true, state: {} });
      }
    }
  }, [location.state, state.projects, showAdd, navigate]);

  // Get project status with overdue detection and urgency
  const getProjectStatus = (project: Project) => {
    const deadline = new Date(project.deadline);
    const isOverdue = currentTime.getTime() > deadline.getTime() && project.status !== 'completed';
    const urgency = getTimeUrgency(project.deadline);

    if (isOverdue) {
      return { label: 'Overdue', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/30', dotColor: 'bg-red-500' };
    }

    // Add urgency indicators for active projects
    if (project.status === 'active') {
      if (urgency.urgency === 'urgent') {
        return { label: 'Urgent', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/30', dotColor: 'bg-red-500' };
      } else if (urgency.urgency === 'soon') {
        return { label: 'Due Soon', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-950/30', dotColor: 'bg-orange-500' };
      }
    }

    switch (project.status) {
      case 'completed':
        return { label: 'Completed', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-950/30', dotColor: 'bg-green-500' };
      case 'in_review':
        return { label: 'In Review', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/30', dotColor: 'bg-blue-500' };
      case 'on_hold':
        return { label: 'In Progress', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', dotColor: 'bg-yellow-500' };
      case 'active':
      default:
        return { label: 'Pending', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-50 dark:bg-slate-950/30', dotColor: 'bg-slate-500' };
    }
  };

  // Calculate financial information
  const getFinancialInfo = (project: Project) => {
    const earned = state.salesDocuments
      .filter(d => d.projectId === project.id && d.type === 'INVOICE' && d.status === 'paid')
      .reduce((sum, d) => sum + d.total, 0);

    const collectionRate = project.totalBudget > 0 ? (earned / project.totalBudget) * 100 : 0;
    const pending = project.totalBudget - earned;

    return { earned, collectionRate, pending };
  };

  return (
    <div className="min-h-screen m-0 p-4 sm:p-0 pt-4 bg-white dark:bg-slate-950">
      <div className="w-full mx-auto p-0 sm:p-0" style={{ maxWidth: '1600px' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-open-sans">Projects</h1>
            <p className="text-sm font-bold text-slate-400 mt-1  ">Project Management</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto flex-1 max-w-2xl px-0 sm:px-4">
            <div className={`relative flex-1 transition-all duration-300 group ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
              <div className={`absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 rounded-2xl blur-xl transition-opacity duration-500 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className={`relative flex items-center bg-slate-100/50 dark:bg-slate-900/50 border-2 rounded-2xl transition-all duration-300 ${isSearchFocused ? 'border-blue-500/50 bg-white dark:bg-slate-900 ring-4 ring-blue-500/10 shadow-lg' : 'border-transparent'}`}>
                <Search size={18} className={`ml-4 transition-colors duration-300 ${isSearchFocused ? 'text-blue-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search projects, clients, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full bg-transparent border-none py-3 px-3 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 px-3 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X size={14} fill="currentColor" className="opacity-50" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold hover:bg-black dark:hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 group shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              Add Project
            </button>
          </div>
        </div>

        {/* Add Project Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/40 dark:bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 sm:p-10 rounded-[3rem] border border-blue-100 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 slide-in-from-top-10 duration-500 relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500"></div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white font-open-sans">{editingProject ? 'Edit Project' : 'Add Project'}</h3>
                  <p className="text-sm font-regular text-slate-400 dark:text-slate-500 mt-2 font-open-sans">Fill in the details for this project below.</p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-3 bg-[#F6F6F6] dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-slate-900 dark:text-slate-300  roboto-font  ml-1">Project Title</label>
                  <input
                    className="w-full px-6 py-4 bg-[#F6F6F6] dark:bg-slate-800 border-2 border-transparent text-slate-900 dark:text-white rounded-[15px] outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-[6px] focus:ring-blue-500/5 text-sm font-bold font-open-sans transition-all placeholder:text-slate-300"
                    placeholder="e.g. Website Redesign"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[14px] font-medium text-slate-900 dark:text-slate-300 roboto-font ml-1">Client</label>
                  <select
                    className="w-full px-6 py-4 bg-[#F6F6F6] dark:bg-slate-800 border-2 border-transparent text-slate-900 dark:text-white rounded-[15px]  outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-[6px] focus:ring-blue-500/5 text-sm font-bold font-open-sans transition-all appearance-none cursor-pointer"
                    value={formData.clientId}
                    onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  >
                    <option value="">Internal Project</option>
                    {state.clients.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[14px] font-medium text-slate-900 dark:text-slate-300 roboto-font ml-1">Budget ({state.settings.currency.symbol})</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-500">{state.settings.currency.symbol}</span>
                    <input
                      type="number"
                      className="w-full pl-12 pr-6 py-4 bg-[#F6F6F6] dark:bg-slate-800 border-2 border-transparent text-slate-900 dark:text-white rounded-[15px]  outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-[6px] focus:ring-blue-500/5 text-sm font-bold font-open-sans transition-all placeholder:text-slate-300"
                      placeholder="0.00"
                      value={formData.totalBudget}
                      onChange={e => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[14px] font-medium text-slate-900 dark:text-slate-300 roboto-font ml-1">Deadline</label>
                  <input
                    type="datetime-local"
                    className="w-full px-6 py-4 bg-[#F6F6F6] dark:bg-slate-800 border-2 border-transparent text-slate-900 dark:text-white rounded-[15px]  outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-[6px] focus:ring-blue-500/5 text-sm font-bold font-open-sans transition-all"
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[14px] font-medium text-slate-900 dark:text-slate-300 roboto-font ml-1">Status</label>
                  <select
                    className="w-full px-6 py-4 bg-[#F6F6F6] dark:bg-slate-800 border-2 border-transparent text-slate-900 dark:text-white rounded-[15px]  outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-[6px] focus:ring-blue-500/5 text-sm font-bold font-open-sans transition-all appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="active" className="dark:bg-slate-900">Pending</option>
                    <option value="on_hold" className="dark:bg-slate-900">In Progress</option>
                    <option value="in_review" className="dark:bg-slate-900">In Review</option>
                    <option value="completed" className="dark:bg-slate-900">Completed</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[14px] font-medium text-slate-900 dark:text-slate-300 roboto-font ml-1">Category</label>
                  <select
                    className="w-full px-6 py-4 bg-[#F6F6F6] dark:bg-slate-800 border-2 border-transparent text-slate-900 dark:text-white rounded-[15px]  outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-[6px] focus:ring-blue-500/5 text-sm font-bold font-open-sans transition-all appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value} className="dark:bg-slate-900">{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[14px] font-medium text-slate-900 dark:text-slate-300 roboto-font ml-1">Description</label>
                <textarea
                  className="w-full px-6 py-4 bg-[#F6F6F6] dark:bg-slate-800 border-2 border-transparent text-slate-900 dark:text-white rounded-[2rem] outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-[6px] focus:ring-blue-500/5 text-sm font-bold font-open-sans transition-all h-40 resize-none leading-relaxed placeholder:text-slate-300"
                  placeholder="Describe your project here..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end items-center gap-8 pt-6">
                <button
                  onClick={resetForm}
                  className="px-8 py-4 text-slate-500 dark:text-slate-400 font-bold font-open-sans text-[14px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-slate-900 dark:bg-blue-600 text-white px-12 py-5 rounded-[15px]  font-bold font-open-sans text-[14px] uppercase tracking-widest shadow-2xl shadow-blue-500/20 dark:shadow-black/40 hover:bg-black dark:hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
                >
                  {editingProject ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </div>
          </div>
        )}







        {/* Board Columns - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start pb-12">
          {columns.map(col => {
            const projects = getProjectsByStatus(col.id);
            return (
              <div
                key={col.id}
                ref={(el) => {
                  if (el) columnRefsMap.current.set(col.id, el);
                  else columnRefsMap.current.delete(col.id);
                }}
                className={`w-full ${col.columnBg} rounded-3xl border-2 p-5 flex flex-col group/column relative overflow-hidden transition-all duration-200
                  ${dragOverColumn === col.id && draggedProjectId
                    ? `${col.columnBorder} shadow-2xl scale-[1.01]`
                    : `border-transparent`
                  }
                `}
              >
                {/* Glowing drop-zone overlay */}
                {dragOverColumn === col.id && draggedProjectId && (
                  <div className={`absolute inset-0 rounded-3xl ring-2 ring-inset pointer-events-none z-10 ${col.id === 'active' ? 'ring-slate-400/40 bg-slate-500/5' :
                    col.id === 'on_hold' ? 'ring-amber-400/40 bg-amber-500/5' :
                      col.id === 'in_review' ? 'ring-blue-400/40 bg-blue-500/5' :
                        'ring-emerald-400/40 bg-emerald-500/5'
                    }`} />
                )}

                {/* Column Header */}
                <div className={`flex items-center justify-between mb-6 px-4 py-3 -mx-1 rounded-2xl shadow-lg ${col.headerBg} ${col.headerBorder}`}>
                  <div className="flex items-center gap-3">
                    <span className={`${col.headerText} ${col.headerIconBg} p-2.5 rounded-xl`}>
                      {col.icon}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <h2 className={`text-[15px] font-bold roboto-font ${col.headerText}`}>
                        {col.label}
                      </h2>
                      <span className={`px-2.5 py-1 ${col.headerBadgeBg} ${col.headerBadgeText} text-[11px] font-extrabold rounded-full`}>
                        {projects.length}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowAdd(true); setFormData({ ...formData, status: col.id }) }}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-all opacity-0 group-hover/column:opacity-100"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-4">
                  {projects.map(project => {
                    const client = state.clients.find(c => c.id === project.clientId);
                    const deadlineDate = new Date(project.deadline);
                    const today = new Date();
                    const diffTime = deadlineDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isOverdue = diffDays < 0;
                    const isCloudy = diffDays >= 0 && diffDays <= 7;

                    return (
                      <div
                        key={project.id}
                        onMouseDown={(e) => handleMouseDown(e, project.id)}
                        onClick={() => { if (!draggedProjectId) setViewProjectId(project.id); }}
                        className={`bg-white dark:bg-slate-950 p-5 rounded-[24px] border shadow-sm transition-all duration-200 group/card relative select-none
                          ${draggedProjectId === project.id
                            ? 'opacity-30 border-dashed border-2 border-slate-300 dark:border-slate-700 shadow-none cursor-grabbing scale-95'
                            : 'border-slate-150 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 cursor-grab'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest roboto-font">
                              {project.category || 'GENERAL'}
                            </span>
                            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white roboto-font group-hover/card:text-blue-600 transition-colors leading-tight pr-6">
                              {project.title || 'Untitled Project'}
                            </h3>
                          </div>
                          <button
                            onClick={(e) => toggleDropdown(project.id, e)}
                            className="p-1.5 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>

                        <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-5 font-medium roboto-font leading-relaxed">
                          {project.description || 'No strategic observations provided for this initiative.'}
                        </p>

                        <div className="flex items-center justify-between mb-5">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider roboto-font">Client</p>
                            <p className="text-[12px] text-slate-900 dark:text-slate-300 font-bold roboto-font">
                              {client?.company || client?.name || 'Independent'}
                            </p>
                          </div>

                          {project.status !== 'completed' && (
                            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${isOverdue ? 'bg-rose-50 border-rose-100 text-rose-600' : isCloudy ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'}`}>
                              <Clock size={12} strokeWidth={2.5} />
                              <span className="text-[11px] font-bold roboto-font">
                                {isOverdue ? 'Overdue' : `${diffDays} days left`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-normal text-slate-400 font-open-sans">Progress</span>
                            <span className={`text-[10px] font-normal ${col.color}`}>
                              {project.status === 'completed' ? '100%' : project.status === 'in_review' ? '75%' : project.status === 'on_hold' ? '45%' : '10%'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${col.barColor} rounded-full transition-all duration-1000`} style={{ width: animateProgress ? (project.status === 'completed' ? '100%' : project.status === 'in_review' ? '75%' : project.status === 'on_hold' ? '45%' : '10%') : '0%' }}></div>
                          </div>
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${col.statusPillBg} ${col.statusPillBorder}`}>
                            <span className={`w-2 h-2 rounded-full ${col.accent} ${col.id !== 'completed' ? 'animate-pulse' : ''}`}></span>
                            <span className={`text-[11px] font-bold roboto-font ${col.statusPillText}`}>
                              {col.label}
                            </span>
                          </div>
                        </div>

                        {/* Dropdown Menu */}
                        {openDropdown === project.id && (
                          <div className="absolute right-4 top-12 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={(e) => handleEdit(project, e)}
                              className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                            >
                              <Settings size={14} /> Edit
                            </button>
                            <button
                              onClick={(e) => handleDelete(project.id, e)}
                              className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Placeholder drop zone when card is being dragged over this column */}
                  {dragOverColumn === col.id && draggedProjectId && !projects.find(p => p.id === draggedProjectId) && (
                    <div className={`h-[170px] rounded-[24px] border-2 border-dashed flex items-center justify-center transition-all ${col.id === 'active' ? 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30' :
                      col.id === 'on_hold' ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20' :
                        col.id === 'in_review' ? 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20' :
                          'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                      }`}>
                      <span className={`text-xs font-bold ${col.id === 'active' ? 'text-slate-400' :
                        col.id === 'on_hold' ? 'text-amber-400' :
                          col.id === 'in_review' ? 'text-blue-400' :
                            'text-emerald-400'
                        }`}>Drop here</span>
                    </div>
                  )}

                  {/* Empty Column State */}
                  {projects.length === 0 && !dragOverColumn && (
                    <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800/50 rounded-[2.5rem] flex flex-col items-center justify-center opacity-40">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center mb-3">
                        <Plus size={18} className="text-slate-400" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No projects</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Toast Notification */}
      {
        toast && (
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
        )
      }

      {/* Delete Confirmation Modal */}
      {/* Delete Confirmation Modal */}
      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={32} className="text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-open-sans">Delete Project?</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-bold font-open-sans">
                  Are you sure you want to delete this project? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-6 py-4 text-slate-500 dark:text-slate-400 font-bold font-open-sans text-sm hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold font-open-sans text-sm shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all active:scale-95"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Complete Confirmation Modal */}
      {
        showCompleteModal && projectToComplete && (
          <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 text-center">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${projectToComplete.status === 'completed'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                  }`}>
                  {projectToComplete.status === 'completed' ? <Zap size={32} /> : <CheckCircle size={32} />}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-open-sans">
                  {projectToComplete.status === 'completed' ? 'Reopen Project?' : 'Complete Project?'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-bold font-open-sans">
                  {projectToComplete.status === 'completed'
                    ? 'This will move the project back to the active list.'
                    : 'This will mark the project as successfully completed.'
                  }
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={cancelComplete}
                    className="flex-1 px-6 py-4 text-slate-500 dark:text-slate-400 font-bold font-open-sans text-sm hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={confirmComplete}
                    className={`flex-1 px-6 py-4 text-white rounded-2xl font-bold font-open-sans text-sm shadow-xl transition-all active:scale-95 ${projectToComplete.status === 'completed'
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                      }`}
                  >
                    Confirm Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      <ProjectDetail
        state={state}
        projectId={viewProjectId}
        isOpen={!!viewProjectId}
        onClose={() => setViewProjectId(null)}
      />

      {/* ── Live Mouse-Follow Ghost Card ── */}
      {draggedProjectId && ghostPos && (() => {
        const project = state.projects.find(p => p.id === draggedProjectId);
        const col = columns.find(c => c.id === project?.status);
        if (!project || !col) return null;
        const client = state.clients.find(c => c.id === project.clientId);
        return (
          <div
            style={{
              position: 'fixed',
              left: ghostPos.x,
              top: ghostPos.y,
              width: ghostSize.w,
              pointerEvents: 'none',
              zIndex: 9999,
              userSelect: 'none',
              borderRadius: 24,
              boxShadow: '0 24px 48px rgba(0,0,0,0.18), 0 6px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
            }}
          >
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex flex-col gap-1 mb-2">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {project.category || 'GENERAL'}
                </span>
                <p className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                  {project.title || 'Untitled Project'}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {client?.name || 'Independent'}
                </span>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${col.statusPillBg} ${col.statusPillBorder} border`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${col.accent}`} />
                  <span className={`text-[10px] font-bold ${col.statusPillText}`}>{col.label}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div >
  );
};

export default Projects;
