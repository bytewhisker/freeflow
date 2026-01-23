import React, { useState } from 'react';
import { AppState, Project } from '../types';
import { generateId, formatDate, formatDateTime, formatCurrency, getStatusColor, getTimeUrgency } from '../utils';
import { Plus, Calendar, ChevronRight, X, Trash2, Edit3, Settings, Filter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Projects: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const [showAdd, setShowAdd] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('todo');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [projectToComplete, setProjectToComplete] = useState<Project | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    clientId: '',
    status: 'active',
    category: 'web_design',
    totalBudget: 0,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to 7 days from now
    description: ''
  });

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
    { value: 'animation', label: 'Animation', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' }
  ];

  // Filter projects based on active tab
  const filteredProjects = state.projects.filter(project => {
    if (activeTab === 'todo') return project.status === 'active';
    if (activeTab === 'in_progress') return project.status === 'on_hold';
    if (activeTab === 'completed') return project.status === 'completed';
    return true;
  });

  // Get counts for each tab
  const todoCount = state.projects.filter(p => p.status === 'active').length;
  const inProgressCount = state.projects.filter(p => p.status === 'on_hold').length;
  const completedCount = state.projects.filter(p => p.status === 'completed').length;

  const handleSubmit = () => {
    if (!formData.title || !formData.clientId) {
      alert('Please provide a title and select a client');
      return;
    }

    if (editingProject) {
      setState((prev: AppState) => ({
        ...prev,
        projects: prev.projects.map(p => p.id === editingProject ? { ...p, ...formData } : p)
      }));
    } else {
      const project: Project = {
        ...(formData as Project),
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      setState((prev: AppState) => ({ ...prev, projects: [...prev.projects, project] }));
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

  // Trigger progress bar animation on component mount
  React.useEffect(() => {
    const timer = setTimeout(() => setAnimateProgress(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Pre-fill client and show form if passed in navigation state
  React.useEffect(() => {
    const stateClientId = (location.state as any)?.clientId;
    if (stateClientId && !showAdd) {
      setFormData(prev => ({ ...prev, clientId: stateClientId }));
      setShowAdd(true);
    }
  }, [location.state]);

  // Get project status with overdue detection and urgency
  const getProjectStatus = (project: Project) => {
    const deadline = new Date(project.deadline);
    const isOverdue = currentTime.getTime() > deadline.getTime() && project.status !== 'completed';
    const urgency = getTimeUrgency(project.deadline);

    if (isOverdue) {
      return { label: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50', dotColor: 'bg-red-500' };
    }

    // Add urgency indicators for active projects
    if (project.status === 'active') {
      if (urgency.urgency === 'urgent') {
        return { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50', dotColor: 'bg-red-500' };
      } else if (urgency.urgency === 'soon') {
        return { label: 'Due Soon', color: 'text-orange-600', bgColor: 'bg-orange-50', dotColor: 'bg-orange-500' };
      }
    }

    switch (project.status) {
      case 'completed':
        return { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-50', dotColor: 'bg-green-500' };
      case 'on_hold':
        return { label: 'In Progress', color: 'text-yellow-600', bgColor: 'bg-yellow-50', dotColor: 'bg-yellow-500' };
      case 'active':
      default:
        return { label: 'Todo', color: 'text-blue-600', bgColor: 'bg-blue-50', dotColor: 'bg-blue-500' };
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
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="w-full p-3">
        {/* Navigation Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            {/* Left: Tabs */}
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('todo')}
                className={`pb-3 px-1 border-b-2 font-semibold transition-all duration-200 ${activeTab === 'todo'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Todo ({todoCount})
              </button>
              <button
                onClick={() => setActiveTab('in_progress')}
                className={`pb-3 px-1 border-b-2 font-semibold transition-all duration-200 ${activeTab === 'in_progress'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`pb-3 px-1 border-b-2 font-semibold transition-all duration-200 ${activeTab === 'completed'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/* Right: Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 active:scale-95 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                Add New Project
              </button>
            </div>
          </div>
        </div>

        {/* Add Project Form */}
        {showAdd && (
          <div className="bg-white p-10 rounded-[2rem] border border-blue-100 shadow-2xl shadow-blue-500/5 space-y-8 animate-in zoom-in-95 slide-in-from-top-4 duration-300 mb-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500"></div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
                <p className="text-slate-500 font-medium text-sm mt-1">Fill in the details below to track your project progress.</p>
              </div>
              <button
                onClick={resetForm}
                className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 label-work-email ml-1 uppercase tracking-wider">Project Title</label>
                <input
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all placeholder:font-medium placeholder:text-slate-300"
                  placeholder="e.g. Website Redesign"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 label-work-email ml-1 uppercase tracking-wider">Select Client</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all appearance-none cursor-pointer"
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Choose a client...</option>
                  {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 label-work-email ml-1 uppercase tracking-wider">Budget Amount ({state.settings.currency.symbol})</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{state.settings.currency.symbol}</span>
                  <input
                    type="number"
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                    placeholder="0.00"
                    value={formData.totalBudget}
                    onChange={e => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 label-work-email ml-1 uppercase tracking-wider">Project Deadline</label>
                <input
                  type="datetime-local"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 label-work-email ml-1 uppercase tracking-wider">Project Status</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all appearance-none cursor-pointer"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="active">🚀 Ongoing / Active</option>
                  <option value="completed">✅ Fully Completed</option>
                  <option value="on_hold">⏸️ On Hold / Paused</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 label-work-email ml-1 uppercase tracking-wider">Work Category</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all appearance-none cursor-pointer"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 label-work-email ml-1 uppercase tracking-wider">Internal Project Notes</label>
              <textarea
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all h-32 resize-none leading-relaxed"
                placeholder="What are the key goals or milestones for this project?"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end items-center gap-6 pt-4">
              <button
                onClick={resetForm}
                className="px-6 py-3 text-slate-500 font-black uppercase text-xs   hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs   shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
              >
                {editingProject ? 'Update Project' : 'Launch Project'}
              </button>
            </div>
          </div>
        )}

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => {
            const client = state.clients.find(c => c.id === project.clientId);
            const earned = state.salesDocuments
              .filter(d => d.projectId === project.id && d.type === 'INVOICE' && d.status === 'paid')
              .reduce((sum, d) => sum + d.total, 0);

            return (
              <Link key={project.id} to={`/projects/${project.id}`} className={`rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden ${(() => {
                const status = getProjectStatus(project);

                if (status.label === 'Overdue') {
                  return 'bg-white border-red-200';
                } else if (project.status === 'completed') {
                  return 'bg-white border-green-200';
                } else if (project.status === 'on_hold') {
                  return 'bg-white border-yellow-200';
                } else {
                  return 'bg-white border-gray-200';
                }
              })()
                }`}>
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 flex-wrap">
                      {/* Category Badge */}
                      {(() => {
                        const category = categories.find(c => c.value === project.category);
                        return category ? (
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${category.bgColor} ${category.textColor}`}>
                            {category.label}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                            No Category
                          </span>
                        );
                      })()}

                      {/* Status Badge */}
                      {(() => {
                        const status = getProjectStatus(project);
                        const urgency = getTimeUrgency(project.deadline);
                        return (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${status.bgColor
                            } ${status.color
                            } ${urgency.urgency === 'overdue' ? 'animate-pulse' : ''
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${status.dotColor} ${urgency.urgency === 'overdue' ? 'animate-ping' : ''
                              }`}></div>
                            {status.label}
                          </span>
                        );
                      })()}


                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(project.id, e)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                        </svg>
                      </button>
                      {/* Dropdown Menu */}
                      {openDropdown === project.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg" style={{ zIndex: 9998 }}>
                          <button
                            onClick={(e) => handleDelete(project.id, e)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-t-lg"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Title and Description */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-gray-100">
                  {/* Deadline Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                      <span>Time Progress</span>
                      <span className={(() => {
                        const urgency = getTimeUrgency(project.deadline);
                        if (urgency.urgency === 'overdue') return 'text-red-600 font-bold';
                        if (urgency.urgency === 'urgent') return 'text-red-600 font-semibold';
                        if (urgency.urgency === 'soon') return 'text-orange-600 font-semibold';
                        return 'text-gray-600';
                      })()}>{(() => {
                        const createdDate = new Date(project.createdAt);
                        const deadline = new Date(project.deadline);

                        // For overdue deadlines, show "OVERDUE" indicator
                        if (currentTime.getTime() > deadline.getTime()) {
                          return 'OVERDUE';
                        }

                        const totalDuration = deadline.getTime() - createdDate.getTime();
                        const elapsed = currentTime.getTime() - createdDate.getTime();
                        const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
                        return `${Math.round(progress)}%`;
                      })()}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${animateProgress ? 'animate-pulse' : ''} ${(() => {
                          const createdDate = new Date(project.createdAt);
                          const deadline = new Date(project.deadline);

                          // Check if deadline has passed
                          if (currentTime.getTime() > deadline.getTime()) {
                            return 'bg-red-500';
                          }

                          const totalDuration = deadline.getTime() - createdDate.getTime();
                          const elapsed = currentTime.getTime() - createdDate.getTime();
                          const progress = (elapsed / totalDuration) * 100;
                          if (progress > 90) return 'bg-red-500';
                          if (progress > 75) return 'bg-yellow-500';
                          return 'bg-green-500';
                        })()
                          }`}
                        style={{
                          width: `${(() => {
                            const createdDate = new Date(project.createdAt);
                            const deadline = new Date(project.deadline);

                            // For overdue deadlines, cap at 100% width
                            if (currentTime.getTime() > deadline.getTime()) {
                              return '100%';
                            }

                            const totalDuration = deadline.getTime() - createdDate.getTime();
                            const elapsed = currentTime.getTime() - createdDate.getTime();
                            return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
                          })()}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    {/* Urgency Indicator */}
                    {(() => {
                      const urgency = getTimeUrgency(project.deadline);
                      return (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
                          <Calendar size={14} className={`${urgency.color}`} />
                          <span className={`text-xs font-medium ${urgency.color}`}>
                            {urgency.text}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Calendar Date */}
                    <div className="flex flex-col items-end text-sm text-gray-500">
                      <span className="text-xs font-medium text-gray-600 mb-1">Due Date</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(project.deadline)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex justify-between items-center">
                    {/* Status Button - Left */}
                    <button
                      onClick={(e) => handleStatusChange(project, e)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-md ${project.status === 'completed'
                        ? 'bg-green-400 text-white hover:bg-green-600 hover:shadow-green-400/25'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-gray-400/25'
                        }`}
                    >
                      {(() => {
                        const status = getProjectStatus(project);
                        if (project.status === 'completed') {
                          return 'Mark Active';
                        } else if (status.label === 'Overdue') {
                          return 'Complete Now';
                        } else {
                          return 'Mark Complete';
                        }
                      })()}
                    </button>

                    {/* Edit Button - Right */}
                    <button
                      onClick={(e) => handleEdit(project, e)}
                      className="px-6 py-2 text-sm font-semibold bg-blue-500 text-white hover:text-blue-700 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/25 rounded-lg transition-all duration-200"
                    >
                      Edit Project
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12">
              <div className="text-gray-400 mb-4">
                <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16" className="mx-auto">
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first project.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
              >
                <Plus size={18} />
                Add New Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Project</h3>
                  <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-8">
                Are you sure you want to delete this project? This will remove the project but keep associated invoices.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-semibold transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteModal && projectToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${projectToComplete.status === 'completed'
                  ? 'bg-blue-100'
                  : 'bg-green-100'
                  }`}>
                  {projectToComplete.status === 'completed' ? (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {projectToComplete.status === 'completed' ? 'Mark as Active' : 'Mark as Complete'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {projectToComplete.status === 'completed' ? 'Reactivate this project' : 'Finish this project'}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-8">
                {projectToComplete.status === 'completed'
                  ? `Are you sure you want to mark "${projectToComplete.title}" as active again? This will indicate the project is back in progress.`
                  : `Are you sure "${projectToComplete.title}" is really finished? This will mark it as completed.`
                }
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelComplete}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmComplete}
                  className={`px-6 py-3 text-white rounded-xl font-semibold transition-colors ${projectToComplete.status === 'completed'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {projectToComplete.status === 'completed' ? 'Yes, Mark Active' : 'Yes, Mark Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
