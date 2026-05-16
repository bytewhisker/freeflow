import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle2, FileText, Briefcase, Clock, Users, AlertCircle, Info } from 'lucide-react';
import { NotificationType } from '../types';

interface ToastProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  onClose: (id: string) => void;
  onClick: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose, onClick, duration = 5000 }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        handleClose();
      }
    }, 100); // More efficient 100ms interval for progress bar

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'invoice_sent': return <FileText className="text-blue-500" size={18} />;
      case 'invoice_paid':
      case 'payment_received': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'invoice_overdue': return <AlertCircle className="text-rose-500" size={18} />;
      case 'project_completed': return <Briefcase className="text-emerald-500" size={18} />;
      case 'project_deadline': return <Clock className="text-amber-500" size={18} />;
      case 'client_added': return <Users className="text-indigo-500" size={18} />;
      default: return <Bell className="text-slate-500" size={18} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'invoice_overdue': return 'bg-rose-500';
      case 'invoice_paid':
      case 'project_completed': return 'bg-emerald-500';
      case 'project_deadline': return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div 
      className={`
        relative pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border-2 border-white dark:border-slate-800/50 
        bg-white dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-black/50
        transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isExiting ? 'translate-y-full opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'}
        animate-in slide-in-from-bottom-full pb-1
      `}
    >
      <div 
        className="flex items-start p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={onClick}
      >
        <div className="flex-shrink-0 pt-0.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
            {getIcon()}
          </div>
        </div>
        <div className="ml-4 flex-1 pt-0.5">
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-2">{message}</p>
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-500 transition-all focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <span className="sr-only">Close</span>
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-slate-100 dark:bg-slate-800 w-full overflow-hidden">
        <div 
          className={`h-full transition-[width] duration-100 ease-linear ${getBgColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Toast;
