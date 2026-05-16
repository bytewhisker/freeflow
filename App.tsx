
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  Search,
  Bell,
  Menu, // Added Menu icon for mobile trigger
  Loader2,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { db } from './db';
import { AppState, Client, Project, SalesDocument } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import Sidebar from './components/Sidebar'; // Import new Sidebar
import NotificationsPanel from './components/NotificationsPanel';
import ToastContainer from './components/ToastContainer';


// Views
import Dashboard from './views/Dashboard';
import Clients from './views/Clients';
import Projects from './views/Projects';
import Billing from './views/Sales';
import BillingForm from './views/SalesForm';
import BillingDetail from './views/SalesDetail';
import ClientPortal from './views/ClientPortal';
import ClientDetail from './views/ClientDetail';
import Settings from './views/Settings';
import Auth from './views/Auth';
import Pricing from './views/Pricing';
import LandingPage from './views/LandingPage';

// SidebarLink component removed as it is now part of Sidebar.tsx

const ConfigErrorScreen = () => (
  <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-white rounded-[32px] border border-slate-200 p-10 shadow-xl text-center">
      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={32} />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-4">Supabase Connection Error</h1>
      <p className="text-slate-500 font-medium mb-8 leading-relaxed">
        The application could not establish a connection to your Supabase backend. Please verify your URL and Anon Key.
      </p>
      <div className="space-y-3">
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase   hover:bg-slate-800 transition-all"
        >
          Open Supabase Dashboard <ExternalLink size={14} />
        </a>
      </div>
    </div>
  </div>
);

type PreAuthScreen = 'landing' | 'auth';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AppState | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [preAuthScreen, setPreAuthScreen] = useState<PreAuthScreen>('landing');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && isSupabaseConfigured && !initialLoadDone.current) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    if (!session) return;
    const data = await db.getState(session.user.id);
    
    // The plan status is now managed natively within the profiles table by the Stripe Webhook.
    // We no longer sync from session.user.user_metadata, which caused downgrades back to 'free'.

    setState(data);
    initialLoadDone.current = true;
    
    // Check for notifications on initial load
    checkAndGenerateNotifications(data);
  };

  const checkAndGenerateNotifications = async (currentState: AppState) => {
    try {
      const { checkOverdueInvoices, checkUpcomingDeadlines } = await import('./lib/notifications');
      
      const overdueNotifications = await checkOverdueInvoices(currentState.salesDocuments);
      const deadlineNotifications = await checkUpcomingDeadlines(currentState.projects);
      
      const allNew = [...overdueNotifications, ...deadlineNotifications];
      
      if (allNew.length > 0) {
        setState(prev => {
          if (!prev) return prev;
          
          // 1. De-duplicate allNew by ID, keeping the latest content
          const uniqueInNew = Array.from(
            new Map(allNew.map(n => [n.id, n])).values()
          );

          // 2. Combine with existing, prioritizing 'new' ones for same ID
          const existingMap = new Map(prev.notifications.map(n => [n.id, n]));
          uniqueInNew.forEach(n => existingMap.set(n.id, n));
          
          const uniqueAll = Array.from(existingMap.values());
          
          // Check if anything actually changed (content-wise)
          const isSame = uniqueAll.length === prev.notifications.length && 
            uniqueAll.every((n, i) => (n as any).id === (prev.notifications[i] as any).id && (n as any).message === (prev.notifications[i] as any).message);

          if (isSame) return prev;
          
          return {
            ...prev,
            notifications: uniqueAll
          };
        });
      }
    } catch (err) {
      console.error('Failed to check notifications:', err);
    }
  };

  // Periodic deadline and overdue check (every 5 minutes)
  useEffect(() => {
    if (!state) return;
    if (!state.projects.length && !state.salesDocuments.length) return;
    
    const interval = setInterval(() => {
      checkAndGenerateNotifications(state);
    }, 5 * 60 * 1000); 
    
    return () => clearInterval(interval);
  }, [state?.projects, state?.salesDocuments]);

  // Improved Syncing logic that handles background persistence
  useEffect(() => {
    if (state && session && isSupabaseConfigured && initialLoadDone.current) {
      const timeout = setTimeout(() => {
        setSyncing(true);
        db.saveState(state, session.user.id).finally(() => setSyncing(false));
      }, 1000); // 1 second debounce for better snappiness
      return () => clearTimeout(timeout);
    }
  }, [state, session]);

  const updateStateAndSync = useCallback((updater: any) => {
    setState((prev: any) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  }, []);

  if (!isSupabaseConfigured) {
    return <ConfigErrorScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-sm font-bold  ">Waking up FreeFlow...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (preAuthScreen === 'landing') {
      return (
        <LandingPage
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onGetStarted={() => setPreAuthScreen('auth')}
          onSignIn={() => setPreAuthScreen('auth')}
        />
      );
    }
    return (
      <Auth
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onBack={() => setPreAuthScreen('landing')}
      />
    );
  }

  if (!state) return null;

  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Routes>
          <Route path="/portal/:docId" element={<ClientPortal state={state} />} />

          <Route path="/*" element={
            <>
              {/* Mobile Header */}
              <header className="md:hidden flex items-center justify-between px-4 h-16 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <LayoutDashboard size={18} />
                  </div>
                  <span className="text-xl font-bold text-black dark:text-white">FreeFlow</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setNotificationsPanelOpen(true)}
                    className="p-2 text-black dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative"
                  >
                    <Bell size={24} />
                    {state.notifications?.some(n => !n.read) && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-50 dark:border-slate-900" />
                    )}
                  </button>
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="p-2 text-black dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <Menu size={24} />
                  </button>
                </div>
              </header>

              <Sidebar
                session={session}
                state={state}
                mobileOpen={mobileSidebarOpen}
                setMobileOpen={setMobileSidebarOpen}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                setNotificationsPanelOpen={setNotificationsPanelOpen}
              />

              <NotificationsPanel 
                isOpen={notificationsPanelOpen} 
                onClose={() => setNotificationsPanelOpen(false)} 
                state={state} 
                setState={updateStateAndSync} 
              />

              <main className="flex-1 flex flex-col min-w-0 min-h-screen min-h-[100dvh] overflow-x-hidden bg-slate-50 dark:bg-slate-950">
                <div className="w-full flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard state={state} />} />
                    <Route path="/clients" element={<Clients state={state} setState={updateStateAndSync} />} />
                    <Route path="/clients/:id" element={<ClientDetail state={state} setState={updateStateAndSync} />} />
                    <Route path="/projects" element={<Projects state={state} setState={updateStateAndSync} />} />
                    <Route path="/billing" element={<Billing state={state} setState={updateStateAndSync} />} />
                    <Route path="/billing/new" element={<BillingForm state={state} setState={updateStateAndSync} />} />
                    <Route path="/billing/edit/:id" element={<BillingForm state={state} setState={updateStateAndSync} />} />
                    <Route path="/billing/view/:id" element={<BillingDetail state={state} setState={updateStateAndSync} />} />
                    <Route path="/pricing" element={<Pricing state={state} />} />
                    <Route path="/settings" element={<Settings state={state} setState={updateStateAndSync} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
              <ToastContainer 
            state={state} 
            onToastClick={() => setNotificationsPanelOpen(true)} 
          />
            </>
          } />
        </Routes>
      </div>
    </HashRouter>
  );
};

// RouteWrapper removed

export default App;
