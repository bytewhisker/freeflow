import React, { useMemo } from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  FileText, 
  Briefcase, 
  Users, 
  AlertCircle, 
  Clock,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppState, Notification } from '../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  setState: any;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose, state, setState }) => {
  const notifications = useMemo(() => {
    return [...(state.notifications || [])].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [state.notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setState((prev: AppState) => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    }));
  };

  const markAllAsRead = () => {
    setState((prev: AppState) => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setState((prev: AppState) => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  const clearAll = () => {
    setState((prev: AppState) => ({
      ...prev,
      notifications: []
    }));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'invoice_sent':
        return <FileText className="text-blue-500" size={18} />;
      case 'invoice_paid':
      case 'payment_received':
        return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'invoice_overdue':
        return <AlertCircle className="text-rose-500" size={18} />;
      case 'project_completed':
        return <Briefcase className="text-emerald-500" size={18} />;
      case 'project_deadline':
        return <Clock className="text-orange-500" size={18} />;
      case 'client_added':
        return <Users className="text-indigo-500" size={18} />;
      default:
        return <Bell className="text-slate-500" size={18} />;
    }
  };

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

  // Click outside to close is handled by overlay
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[200] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[210] flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Bell size={20} className={unreadCount > 0 ? "animate-[ring_2s_ease-in-out_infinite]" : ""} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight font-open-sans">Notifications</h2>
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'You\'re all caught up!'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
            <button 
              onClick={markAllAsRead}
              className="text-[12px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase tracking-wider"
            >
              Mark all as read
            </button>
            <button 
              onClick={clearAll}
              className="text-[12px] font-bold text-rose-500 dark:text-rose-400 hover:text-rose-600 transition-colors uppercase tracking-wider"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 opacity-70">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center relative">
                <Bell size={28} className="text-slate-300 dark:text-slate-600" />
                <div className="absolute inset-0 bg-slate-200/20 dark:bg-slate-700/20 rounded-full animate-ping delay-1000 duration-3000" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No notifications yet</p>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-600 mt-1 max-w-[200px] mx-auto">
                  When you have new alerts, they will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`relative p-5 transition-colors cursor-pointer group flex gap-4
                    ${notification.read ? 'hover:bg-slate-50 dark:hover:bg-slate-900/50 bg-white/50 dark:bg-transparent' : 'bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/80 dark:hover:bg-blue-900/20'}
                  `}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-md" />
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm
                    ${notification.type.includes('invoice') ? 'bg-blue-100 dark:bg-blue-900/30' : 
                      notification.type.includes('project') ? (notification.type.includes('deadline') ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30') :
                      'bg-indigo-100 dark:bg-indigo-900/30'}
                  `}
                  >
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-bold truncate ${notification.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap shrink-0">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className={`text-[13px] leading-relaxed ${notification.read ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>
                      {notification.message}
                    </p>
                    
                    {notification.link && (
                      <div className="mt-3 flex items-center">
                        <Link 
                          to={notification.link}
                          onClick={() => {
                            if (!notification.read) markAsRead(notification.id);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                          View Details <ExternalLink size={12} />
                        </Link>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={(e) => deleteNotification(notification.id, e)}
                    className="absolute top-5 right-5 p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-all translate-x-2 group-hover:translate-x-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
