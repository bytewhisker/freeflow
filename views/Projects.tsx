import React, { useState, useRef, useEffect } from 'react';
import { AppState, Project } from '../types';
import { generateId, formatDate, formatDateTime, formatCurrency, getStatusColor, getTimeUrgency, getRemainingTime } from '../utils';
import { Plus, Calendar, ChevronRight, X, Trash2, Edit3, Settings, Filter, CheckCircle, Zap, AlertCircle, Circle, RefreshCw, MoreHorizontal, Paperclip, MessageSquare, Flag, ArrowRight, Clock, Briefcase, TrendingUp, Search, User, DollarSign, Tag, AlignLeft, Layers, Bookmark, Activity, MoreVertical, SortAsc, SortDesc, Crown, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Status } from '../types';
import ProjectDetail from './ProjectDetail';

const Projects: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const [showAdd, setShowAdd] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is on free plan and has reached project limit
  const isFreePlan = state.settings.profile.plan === 'free';
  const projectLimit = 10;
  const activeProjectsCount = state.projects.filter(p => p.status !== 'completed').length;
  const hasReachedProjectLimit = isFreePlan && activeProjectsCount >= projectLimit;
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showAllProjectsModal, setShowAllProjectsModal] = useState(false);
  const [allProjectsStatus, setAllProjectsStatus] = useState<Status | null>(null);
  const [allProjectsSearch, setAllProjectsSearch] = useState('');
  const [allProjectsSort, setAllProjectsSort] = useState<'newest' | 'oldest'>('newest');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [projectToComplete, setProjectToComplete] = useState<Project | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  // ── Pure mouse drag state ──
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [ghostSize, setGhostSize] = useState<{ w: number; h: number }>({ w: 260, h: 180 });
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const columnRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [formData, setFormData] = useState<Partial<Project & { customClientName?: string }>>({
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
    { value: 'web_design', label: 'Web Design', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-blue-600 dark:text-blue-400' },
    { value: 'logo_animation', label: 'Logo Animation', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-red-500 dark:text-red-400' },
    { value: 'logo_design', label: 'Logo Design', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-purple-600 dark:text-purple-400' },
    { value: 'video_editing', label: 'Video Editing', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-sky-500 dark:text-sky-400' },
    { value: 'graphic_design', label: 'Graphic Design', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-pink-600 dark:text-pink-400' },
    { value: 'writing', label: 'Writing', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-green-600 dark:text-green-400' },
    { value: 'marketing', label: 'Marketing', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-amber-600 dark:text-amber-400' },
    { value: 'development', label: 'Development', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-indigo-600 dark:text-indigo-400' },
    { value: 'photography', label: 'Photography', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-teal-600 dark:text-teal-400' },
    { value: 'consulting', label: 'Consulting', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-orange-600 dark:text-orange-400' },
    { value: 'animation', label: 'Animation', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-cyan-600 dark:text-cyan-400' },
    { value: 'others', label: 'Others', bgColor: 'bg-[#F8F9FB] dark:bg-slate-800/50', textColor: 'text-slate-600 dark:text-slate-300' }
  ];

  // Group projects into columns with search filtering
  const getProjectsByStatus = (status: Status) => {
    return state.projects
      .filter(p => {
        if (p.status !== status) return false;
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();

        // Handle custom client display
        let clientName = '';
        if (p.clientId === 'other') {
          clientName = (p as any).clientName || 'Custom Client';
        } else {
          const client = state.clients.find(c => c.id === p.clientId);
          clientName = client?.company || client?.name || '';
        }

        const clientMatch = clientName.toLowerCase().includes(q);
        const titleMatch = p.title?.toLowerCase().includes(q);
        const categoryMatch = p.category?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);

        return titleMatch || clientMatch || categoryMatch || descMatch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const columns: { id: Status; label: string; icon: React.ReactNode; color: string; accent: string; barColor: string; headerBg: string; headerBorder: string; headerText: string; headerIconBg: string; headerBadgeBg: string; headerBadgeText: string; columnBg: string; columnBorder: string; iconBg: string; badgeBg: string; badgeText: string; cardBorder: string; statusPillBg: string; statusPillText: string; statusPillBorder: string }[] = [
    { id: 'active', label: 'To - Do', icon: <Circle size={18} />, color: 'text-slate-600 dark:text-slate-300', accent: 'bg-slate-300 dark:bg-slate-600', barColor: 'bg-slate-400', headerBg: 'bg-transparent', headerBorder: '', headerText: 'text-slate-900 dark:text-white', headerIconBg: 'bg-white/20', headerBadgeBg: 'bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700', headerBadgeText: 'text-slate-400 dark:text-slate-400', columnBg: 'bg-slate-50/60 dark:bg-slate-900/30', columnBorder: 'border-slate-200/80 dark:border-slate-800', iconBg: 'bg-slate-200 dark:bg-slate-700', badgeBg: 'bg-slate-200 dark:bg-slate-700', badgeText: 'text-slate-600 dark:text-slate-300', cardBorder: 'border-l-slate-400', statusPillBg: 'bg-slate-100 dark:bg-slate-800', statusPillText: 'text-slate-600 dark:text-slate-300', statusPillBorder: 'border-slate-200 dark:border-slate-700' },
    { id: 'on_hold', label: 'On Progress', icon: <Zap size={18} />, color: 'text-amber-500 dark:text-amber-400', accent: 'bg-amber-400 dark:bg-amber-500', barColor: 'bg-amber-500', headerBg: 'bg-transparent', headerBorder: '', headerText: 'text-slate-900 dark:text-white', headerIconBg: 'bg-white/20', headerBadgeBg: 'bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700', headerBadgeText: 'text-slate-400 dark:text-slate-400', columnBg: 'bg-amber-50/30 dark:bg-amber-950/10', columnBorder: 'border-amber-200/60 dark:border-amber-900/40', iconBg: 'bg-amber-100 dark:bg-amber-900/50', badgeBg: 'bg-amber-100 dark:bg-amber-900/40', badgeText: 'text-amber-700 dark:text-amber-300', cardBorder: 'border-l-amber-400', statusPillBg: 'bg-amber-50 dark:bg-amber-950/40', statusPillText: 'text-amber-700 dark:text-amber-300', statusPillBorder: 'border-amber-200 dark:border-amber-800' },
    { id: 'in_review', label: 'In Review', icon: <RefreshCw size={18} />, color: 'text-blue-600 dark:text-blue-400', accent: 'bg-blue-400 dark:bg-blue-500', barColor: 'bg-blue-500', headerBg: 'bg-transparent', headerBorder: '', headerText: 'text-slate-900 dark:text-white', headerIconBg: 'bg-white/20', headerBadgeBg: 'bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700', headerBadgeText: 'text-slate-400 dark:text-slate-400', columnBg: 'bg-blue-50/30 dark:bg-blue-950/10', columnBorder: 'border-blue-200/60 dark:border-blue-900/40', iconBg: 'bg-blue-100 dark:bg-blue-900/50', badgeBg: 'bg-blue-100 dark:bg-blue-900/40', badgeText: 'text-blue-700 dark:text-blue-300', cardBorder: 'border-l-blue-400', statusPillBg: 'bg-blue-50 dark:bg-blue-950/40', statusPillText: 'text-blue-700 dark:text-blue-300', statusPillBorder: 'border-blue-200 dark:border-blue-800' },
    { id: 'completed', label: 'Completed', icon: <CheckCircle size={18} />, color: 'text-green-500 dark:text-emerald-400', accent: 'bg-emerald-400 dark:bg-emerald-500', barColor: 'bg-emerald-500', headerBg: 'bg-transparent', headerBorder: '', headerText: 'text-slate-900 dark:text-white', headerIconBg: 'bg-white/20', headerBadgeBg: 'bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700', headerBadgeText: 'text-slate-400 dark:text-slate-400', columnBg: 'bg-emerald-50/30 dark:bg-emerald-950/10', columnBorder: 'border-emerald-200/60 dark:border-emerald-900/40', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40', badgeText: 'text-emerald-700 dark:text-emerald-300', cardBorder: 'border-l-emerald-400', statusPillBg: 'bg-emerald-200 dark:bg-emerald-950/40', statusPillText: 'text-emerald-700 dark:text-emerald-300', statusPillBorder: 'border-emerald-200 dark:border-emerald-800' }
  ];

  const handleSubmit = () => {
    // Check if user is on free plan and has reached limit
    if (!editingProject && hasReachedProjectLimit) {
      setShowUpgradeModal(true);
      return;
    }

    const projectData = {
      title: formData.title,
      clientId: formData.clientId === 'other' ? undefined : formData.clientId,
      clientName: formData.clientId === 'other' ? formData.customClientName : undefined,
      totalBudget: formData.totalBudget,
      deadline: formData.deadline,
      status: formData.status,
      category: formData.category,
      description: formData.description,
      createdAt: new Date().toISOString()
    };

    if (editingProject) {
      setState((prev: AppState) => {
        const oldProject = prev.projects.find(p => p.id === editingProject);
        let newNotifications = [...(prev.notifications || [])];
        if (oldProject?.status !== 'completed' && formData.status === 'completed') {
           newNotifications.unshift({
             id: Math.random().toString(36).substr(2, 9),
             type: 'project_completed',
             title: 'Project Completed',
             message: `Great job! "${formData.title}" is now marked as completed.`,
             read: false,
             createdAt: new Date().toISOString(),
             link: `/projects`,
             metadata: { projectId: editingProject }
           });
        }
        const projectDataWithISO = {
          ...projectData,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
        };

        return {
          ...prev,
          projects: prev.projects.map(p => p.id === editingProject ? { ...p, ...projectDataWithISO } : p),
          notifications: newNotifications
        };
      });
    } else {
      const project = {
        id: generateId(),
        ...projectData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        createdAt: new Date().toISOString()
      };
      setState((prev: AppState) => {
         let newNotifications = [...(prev.notifications || [])];
         if (projectData.status === 'completed') {
           newNotifications.unshift({
             id: Math.random().toString(36).substr(2, 9),
             type: 'project_completed',
             title: 'Project Completed',
             message: `"${formData.title}" was marked as completed.`,
             read: false,
             createdAt: new Date().toISOString(),
             link: `/projects`,
             metadata: { projectId: project.id }
           });
         } else {
           newNotifications.unshift({
             id: Math.random().toString(36).substr(2, 9),
             type: 'project_deadline',
             title: 'New Project Started',
             message: `Project "${formData.title}" has been created.`,
             read: false,
             createdAt: new Date().toISOString(),
             link: `/projects`,
             metadata: { projectId: project.id }
           });
         }
         return {
           ...prev,
           projects: [...prev.projects, project],
           notifications: newNotifications
         };
      });
    }

    resetForm();
    setShowAdd(false);
  };

  const resetForm = () => {
    setShowAdd(false);
    setEditingProject(null);
    setFormData({
      title: '',
      clientId: '',
      status: 'active',
      category: 'web_design',
      totalBudget: 0,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      description: '',
      customClientName: ''
    });
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
    
    // Format ISO deadline back to YYYY-MM-DDTHH:mm for datetime-local input
    // and adjust for local timezone to match what the user originally entered
    const deadlineDate = project.deadline ? new Date(project.deadline) : null;
    let formattedDeadline = '';
    
    if (deadlineDate) {
      const year = deadlineDate.getFullYear();
      const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
      const day = String(deadlineDate.getDate()).padStart(2, '0');
      const hours = String(deadlineDate.getHours()).padStart(2, '0');
      const minutes = String(deadlineDate.getMinutes()).padStart(2, '0');
      formattedDeadline = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    setFormData({
      ...project,
      deadline: formattedDeadline
    });
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
      setState((prev: AppState) => {
        let newNotifications = [...(prev.notifications || [])];
        if (newStatus === 'completed') {
           newNotifications.unshift({
             id: Math.random().toString(36).substr(2, 9),
             type: 'project_completed',
             title: 'Project Completed',
             message: `Great job! "${projectToComplete.title}" is now marked as completed.`,
             read: false,
             createdAt: new Date().toISOString(),
             link: `/projects`,
             metadata: { projectId: projectToComplete.id }
           });
        }
        return {
          ...prev,
          projects: prev.projects.map(p => p.id === projectToComplete.id ? { ...p, status: newStatus } : p),
          notifications: newNotifications
        };
      });
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
          setState((prev: AppState) => {
             let newNotifications = [...(prev.notifications || [])];
             if (targetStatus === 'completed') {
               newNotifications.unshift({
                 id: generateId(),
                 type: 'project_completed',
                 title: 'Success!',
                 message: `Project "${project.title}" has been completed.`,
                 read: false,
                 createdAt: new Date().toISOString(),
                 link: `/projects`,
                 metadata: { projectId: project.id }
               });
             }
             return {
               ...prev,
               projects: prev.projects.map(p =>
                 p.id === draggedProjectId
                   ? { ...p, status: targetStatus!, createdAt: new Date().toISOString() }
                   : p
               ),
               notifications: newNotifications
             };
          });
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
        return { label: 'On Hold', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', dotColor: 'bg-yellow-500' };
      case 'active':
      default:
        return { label: 'Active', color: 'text-slate-600 dark:text-slate-300', bgColor: 'bg-slate-50 dark:bg-slate-950/30', dotColor: 'bg-slate-500' };
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
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 flex flex-col relative">

              <div className="px-8 pt-8 pb-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-open-sans tracking-tight">
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 font-open-sans text-sm">
                    Create and manage your project details
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-8 pb-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 font-open-sans">Project Title</label>
                      <input
                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-400 text-slate-900 dark:text-white rounded-[10px] outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal"
                        placeholder="Enter project name..."
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-800 dark:text-slate-300 font-open-sans">Client</label>
                        <div className="space-y-3">
                          <div className="relative">
                            <select
                              className="w-full pl-5 pr-10 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-400 text-slate-900 dark:text-white rounded-[10px] outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans appearance-none cursor-pointer text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal"
                              value={formData.clientId === 'other' ? 'other' : formData.clientId}
                              onChange={e => {
                                const value = e.target.value;
                                setFormData({
                                  ...formData,
                                  clientId: value,
                                  customClientName: value === 'other' ? '' : undefined
                                });
                              }}
                            >
                              <option value="">Select a client...</option>
                              {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              <option value="other" className="font-medium text-blue-600 dark:text-blue-400">➝ Other (Custom Client)</option>
                            </select>
                            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                          </div>

                          {formData.clientId === 'other' && (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Enter custom client name..."
                                className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-400 text-slate-900 dark:text-white rounded-[10px] outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans text-sm placeholder:text-blue-400 dark:placeholder:text-blue-400 font-normal"
                                value={formData.customClientName || ''}
                                onChange={e => setFormData({ ...formData, customClientName: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 font-open-sans">Budget</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">{state.settings.currency.symbol}</span>
                          <input
                            type="number"
                            className="w-full pl-10 pr-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-400 text-slate-900 dark:text-white rounded-[10px] outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal"
                            placeholder="0.00"
                            value={formData.totalBudget}
                            onChange={e => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 font-open-sans">Deadline</label>
                        <input
                          type="datetime-local"
                          className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-400 text-slate-900 dark:text-white rounded-[10px] outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal"
                          value={formData.deadline}
                          onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 font-open-sans">Status</label>
                        <div className="relative">
                          <select
                            className="w-full pl-5 pr-10 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-400 text-slate-900 dark:text-white rounded-[10px] outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans appearance-none cursor-pointer text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                          >
                            <option value="active">To Do</option>
                            <option value="on_hold">In Progress</option>
                            <option value="in_review">In Review</option>
                            <option value="completed">Completed</option>
                          </select>
                          <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 font-open-sans">Category</label>
                      <div className="relative">
                        <select
                          className="w-full pl-5 pr-10 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-400 text-slate-900 dark:text-white rounded-[10px] outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans appearance-none cursor-pointer text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal"
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                        >
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 font-open-sans">Brief Description</label>
                      <textarea
                        className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-400 text-slate-900 dark:text-white rounded-[10px] outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans h-32 resize-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal text-sm scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
                        placeholder="Enter project brief description..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 text-slate-500 font-bold font-open-sans text-sm hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold font-open-sans text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
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
                  if (!el) columnRefsMap.current.delete(col.id);
                }}
                className={`w-full ${col.columnBg} rounded-3xl border-2 p-5 flex flex-col group relative overflow-hidden transition-all duration-200
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
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-[1.125rem] rounded-full ${col.accent}`}></div>
                    <div className="flex items-center gap-3">
                      <h2 className={`text-[17px] font-medium tracking-tight roboto-font ${col.headerText}`}>
                        {col.label}
                      </h2>
                      <span className={`min-w-[1.75rem] h-[1.25rem] px-1.5 flex items-center justify-center ${col.headerBadgeBg} ${col.headerBadgeText} text-[11px] font-semibold rounded-md`}>
                        {projects.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/column:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setShowAdd(true); setFormData({ ...formData, status: col.id }) }}
                      className="p-1 items-center justify-center flex text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                    </button>
                    <button className="p-1 items-center justify-center flex text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                      <MoreVertical size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-4">
                  {projects.slice(0, 10).map(project => {
                    // Handle custom client display
                    let clientName = '';
                    if (project.clientId === 'other') {
                      clientName = (project as any).clientName || 'Custom Client';
                    } else {
                      const client = state.clients.find(c => c.id === project.clientId);
                      clientName = client?.company || client?.name || '';
                    }

                    const remaining = getRemainingTime(project.deadline);
                    const isOverdue = remaining.text === 'Overdue';
                    const isCloudy = remaining.urgency === 'soon' || remaining.urgency === 'urgent';

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
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-block px-3 py-1 rounded-[8px] text-[11px] mb-2 font-bold roboto-font text-center ${categories.find(c => c.value === project.category)?.bgColor || 'bg-[#F8F9FB] dark:bg-slate-800/50'} ${categories.find(c => c.value === project.category)?.textColor || 'text-slate-600 dark:text-slate-300'}`}>
                              {categories.find(c => c.value === project.category)?.label || project.category || 'General'}
                            </span>
                            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white roboto-font group-hover/card:text-blue-600 transition-colors leading-tight pr-6 mt-1">
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

                        {project.description && (
                          <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-5 font-medium roboto-font leading-relaxed">
                            {project.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-5">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider roboto-font">Client</p>
                            <p className="text-[12px] text-slate-900 dark:text-slate-300 font-bold roboto-font">
                              {clientName || 'Independent'}
                            </p>
                          </div>

                          {project.status !== 'completed' && (
                            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${isOverdue ? 'bg-rose-50 border-rose-100 text-rose-600' : isCloudy ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'}`}>
                              <Clock size={12} strokeWidth={2.5} />
                              <span className="text-[11px] font-bold roboto-font">
                                {remaining.text}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-normal text-slate-400 font-open-sans">Progress</span>
                            <span className={`text-[10px] font-normal ${col.color}`}>
                              {project.status === 'completed' ? '100%' : project.status === 'in_review' ? '75%' : project.status === 'on_hold' ? '45%' : '10%'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${col.barColor} rounded-full transition-all duration-1000`} style={{ width: animateProgress ? (project.status === 'completed' ? '100%' : project.status === 'in_review' ? '75%' : project.status === 'on_hold' ? '45%' : '10%') : '0%' }}></div>
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

                  {/* See All Button */}
                  {projects.length > 10 && (
                    <button
                      onClick={() => { setAllProjectsStatus(col.id); setShowAllProjectsModal(true); }}
                      className="w-full py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                    >
                      See all {projects.length} projects
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      {/* All Projects Modal */}
      {showAllProjectsModal && allProjectsStatus && (
        <div className="fixed inset-0 bg-slate-950/20 dark:bg-slate-950/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-10 duration-500 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 pt-8 pb-4 flex justify-between items-start border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-2xl font-bold text-black dark:text-white font-open-sans tracking-tight">
                  All {columns.find(c => c.id === allProjectsStatus)?.label} Projects
                </h3>
                <p className="text-slate-400 dark:text-slate-500 mt-1 font-open-sans font-bold text-xs">
                  Browse and manage all your projects
                </p>
              </div>
              <button
                onClick={() => { setShowAllProjectsModal(false); setAllProjectsSearch(''); setAllProjectsSort('newest'); }}
                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-black dark:hover:text-white rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search and Sort Controls */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={allProjectsSearch}
                    onChange={(e) => setAllProjectsSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F8F9FB] dark:bg-slate-800/50 border-2 border-transparent text-black dark:text-white rounded-xl outline-none focus:border-black dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold font-open-sans text-sm placeholder:text-black/50 dark:placeholder:text-white/50"
                  />
                  {allProjectsSearch && (
                    <button
                      onClick={() => setAllProjectsSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Sort by:</span>
                  <div className="flex bg-[#F8F9FB] dark:bg-slate-800/50 rounded-xl p-1">
                    <button
                      onClick={() => setAllProjectsSort('newest')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${allProjectsSort === 'newest'
                          ? 'bg-black dark:bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <SortDesc size={14} />
                        Newest
                      </div>
                    </button>
                    <button
                      onClick={() => setAllProjectsSort('oldest')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${allProjectsSort === 'oldest'
                          ? 'bg-black dark:bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <SortAsc size={14} />
                        Oldest
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(() => {
                  const projects = state.projects
                    .filter(p => p.status === allProjectsStatus)
                    .filter(p => {
                      if (!allProjectsSearch.trim()) return true;
                      const q = allProjectsSearch.toLowerCase();

                      // Handle custom client display
                      let clientName = '';
                      if (p.clientId === 'other') {
                        clientName = (p as any).clientName || 'Custom Client';
                      } else {
                        const client = state.clients.find(c => c.id === p.clientId);
                        clientName = client?.company || client?.name || '';
                      }

                      const clientMatch = clientName.toLowerCase().includes(q);
                      const titleMatch = p.title?.toLowerCase().includes(q);
                      const categoryMatch = p.category?.toLowerCase().includes(q);
                      const descMatch = p.description?.toLowerCase().includes(q);
                      return titleMatch || clientMatch || categoryMatch || descMatch;
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.createdAt).getTime();
                      const dateB = new Date(b.createdAt).getTime();
                      return allProjectsSort === 'newest' ? dateB - dateA : dateA - dateB;
                    });

                  if (projects.length === 0) {
                    return (
                      <div className="col-span-full py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Search size={24} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold">
                          {allProjectsSearch ? 'No projects found matching your search' : 'No projects in this category'}
                        </p>
                      </div>
                    );
                  }

                  return projects.map(project => {
                    // Handle custom client display
                    let clientName = '';
                    if (project.clientId === 'other') {
                      clientName = (project as any).clientName || 'Custom Client';
                    } else {
                      const client = state.clients.find(c => c.id === project.clientId);
                      clientName = client?.company || client?.name || '';
                    }

                    const col = columns.find(c => c.id === project.status);
                    const deadlineDate = new Date(project.deadline);
                    const today = new Date();
                    const diffTime = deadlineDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isOverdue = diffDays < 0;

                    return (
                      <div
                        key={project.id}
                        onClick={() => { setViewProjectId(project.id); setShowAllProjectsModal(false); }}
                        className="bg-white dark:bg-slate-950 p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-block px-3 py-1 rounded-[8px] text-[11px] mb-2 font-bold roboto-font text-center ${categories.find(c => c.value === project.category)?.bgColor || 'bg-[#F8F9FB] dark:bg-slate-800/50'} ${categories.find(c => c.value === project.category)?.textColor || 'text-slate-600 dark:text-slate-300'}`}>
                              {categories.find(c => c.value === project.category)?.label || project.category || 'General'}
                            </span>
                            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white roboto-font group-hover:text-blue-600 transition-colors leading-tight pr-6 mt-1">
                              {project.title || 'Untitled Project'}
                            </h3>
                          </div>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${col?.statusPillBg} ${col?.statusPillBorder} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${col?.accent}`} />
                            <span className={`text-[10px] font-bold ${col?.statusPillText}`}>{col?.label}</span>
                          </div>
                        </div>

                        {project.description && (
                          <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 font-medium roboto-font leading-relaxed">
                            {project.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider roboto-font">Client</p>
                            <p className="text-[12px] text-slate-900 dark:text-slate-300 font-bold roboto-font">
                              {clientName || 'Independent'}
                            </p>
                          </div>

                          {project.status !== 'completed' && (
                            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${isOverdue ? 'bg-rose-50 border-rose-100 text-rose-600' : diffDays >= 0 && diffDays <= 7 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'}`}>
                              <Clock size={12} strokeWidth={2.5} />
                              <span className="text-[11px] font-bold roboto-font">
                                {isOverdue ? 'Overdue' : `${diffDays} days left`}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-400">
                              {formatDate(project.createdAt)}
                            </span>
                          </div>
                          {project.totalBudget > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign size={12} className="text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                {formatCurrency(project.totalBudget, currencyCode)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-400">
                {state.projects.filter(p => p.status === allProjectsStatus).length} total projects
              </p>
              <button
                onClick={() => { setShowAllProjectsModal(false); setAllProjectsSearch(''); setAllProjectsSort('newest'); }}
                className="px-6 py-3 bg-black dark:bg-blue-600 text-white rounded-xl font-bold font-open-sans text-sm shadow-md hover:bg-slate-800 dark:hover:bg-blue-700 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



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

      {/* Upgrade to Pro Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
              
              {/* Header */}
              <div className="relative p-10 pb-0 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25">
                  <Crown size={40} className="text-white" />
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 font-open-sans">
                  Upgrade to Pro
                </h2>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full mb-6">
                  <Zap size={16} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">LIMITED TIME OFFER</span>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-10 pt-0">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Current Plan</span>
                    <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">FREE</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <X size={16} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Limited to {projectLimit} Projects</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">You've reached your limit</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <X size={16} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Limited to 10 Clients</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Restricts your growth</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <X size={16} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Basic Invoice Templates</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">No professional designs</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Pro Plan</span>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg">RECOMMENDED</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Unlimited Projects</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Scale without limits</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Unlimited Clients</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Grow your business</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Pro Invoice Templates</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Professional designs</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Priority Support</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Get help fast</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">$9</span>
                    <span className="text-lg font-bold text-slate-500 dark:text-slate-400">/month</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cancel anytime • No setup fees</p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black font-open-sans text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95 hover:from-blue-700 hover:to-purple-700"
                  >
                    Upgrade Now - Save 20%
                  </button>
                  
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full px-6 py-3 text-slate-500 dark:text-slate-400 font-bold font-open-sans text-sm hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw size={16} className="text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">30-Day Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        // Handle custom client display
        let clientName = '';
        if (project.clientId === 'other') {
          clientName = (project as any).clientName || 'Custom Client';
        } else {
          const client = state.clients.find(c => c.id === project.clientId);
          clientName = client?.company || client?.name || '';
        }

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
                <span className="inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
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
                  {clientName || 'Independent'}
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
      
    </div>
  </div>
  );
};

export default Projects;
