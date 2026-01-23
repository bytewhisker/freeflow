
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  Search,
  Bell,
  Wallet,
  Plus,
  LogOut,
  Settings as SettingsIcon,
  Cloud,
  Loader2,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  // Fix: Added missing RefreshCw import
  RefreshCw
} from 'lucide-react';
import { db } from './db';
import { AppState, Client, Project, SalesDocument } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// Views
import Dashboard from './views/Dashboard';
import Clients from './views/Clients';
import Projects from './views/Projects';
import ProjectDetail from './views/ProjectDetail';
import Billing from './views/Sales';
import BillingForm from './views/SalesForm';
import BillingDetail from './views/SalesDetail';
import ClientPortal from './views/ClientPortal';
import ClientDetail from './views/ClientDetail';
import Settings from './views/Settings';
import Auth from './views/Auth';

const SidebarLink = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
        ? 'bg-gray-200 text-white shadow-lg shadow-blue-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <Icon size={18} />
    <span className="font-bold text-sm">{label}</span>
  </Link>
);

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

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AppState | null>(null);
  const [syncing, setSyncing] = useState(false);
  const initialLoadDone = useRef(false);

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
    setState(data);
    initialLoadDone.current = true;
  };

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
          <p className="text-sm font-black text-slate-400 uppercase  ">Waking up FreeFlow...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (!state) return null;

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-white">
        <Routes>
          <Route path="/portal/:docId" element={<ClientPortal state={state} />} />

          <Route path="/*" element={
            <>
              <aside className="w-64 bg-[#FAF9F7] border-r border-slate-200 flex flex-col sticky top-0 h-screen no-print">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-10">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                      <Wallet size={20} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900">FreeFlow</span>
                  </div>
                  <nav className="space-y-1.5">
                    <RouteWrapper />
                  </nav>
                </div>
                <div className="mt-auto p-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 px-4 py-3 text-[9px] font-black uppercase text-slate-400   bg-slate-100/50 rounded-xl mb-6">
                    {syncing ? (
                      <RefreshCw size={12} className="animate-spin text-blue-600" />
                    ) : (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    )}
                    {syncing ? 'Syncing...' : 'Cloud Synced'}
                  </div>
                  <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 mb-2 transition-all">
                    <SettingsIcon size={18} />
                    <span className="font-bold text-sm">Settings</span>
                  </Link>
                  <div className="flex items-center gap-3 mb-6 px-4 py-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-black text-slate-500 shadow-sm uppercase">
                      {session.user.email?.[0]}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-black text-slate-900 truncate">{session.user.email?.split('@')[0]}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase  ">Pro Member</p>
                    </div>
                  </div>
                  <button onClick={() => supabase?.auth.signOut()} className="flex items-center gap-2 text-slate-400 hover:text-rose-500 text-xs font-black uppercase   transition-colors px-4 py-2 w-full">
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </aside>

              <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10 no-print">
                  <div className="flex items-center gap-4 bg-slate-100/50 px-6 py-3 rounded-2xl w-[400px] border border-transparent focus-within:border-blue-500/20 focus-within:bg-white transition-all">
                    <Search size={18} className="text-slate-400" />
                    <input type="text" placeholder="Quick find clients, projects..." className="bg-transparent border-none outline-none text-sm w-full text-slate-900 font-medium" />
                  </div>

                </header>

                <div className="p-3 w-full overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard state={state} />} />
                    <Route path="/clients" element={<Clients state={state} setState={updateStateAndSync} />} />
                    {/* Fixed: ClientDetail now handles missing clientId/onClose via useParams/useNavigate */}
                    <Route path="/clients/:id" element={<ClientDetail state={state} setState={updateStateAndSync} />} />
                    <Route path="/projects" element={<Projects state={state} setState={updateStateAndSync} />} />
                    {/* Fixed: ProjectDetail does not accept setState prop */}
                    <Route path="/projects/:id" element={<ProjectDetail state={state} />} />
                    <Route path="/billing" element={<Billing state={state} setState={updateStateAndSync} />} />
                    <Route path="/billing/new" element={<BillingForm state={state} setState={updateStateAndSync} />} />
                    <Route path="/billing/edit/:id" element={<BillingForm state={state} setState={updateStateAndSync} />} />
                    <Route path="/billing/view/:id" element={<BillingDetail state={state} setState={updateStateAndSync} />} />
                    <Route path="/settings" element={<Settings state={state} setState={updateStateAndSync} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </>
          } />
        </Routes>
      </div>
    </HashRouter>
  );
};

const RouteWrapper = () => {
  const location = useLocation();
  const path = location.pathname;
  return (
    <>
      <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={path === '/'} />
      <SidebarLink to="/clients" icon={Users} label="Clients" active={path.startsWith('/clients')} />
      <SidebarLink to="/projects" icon={Briefcase} label="Projects" active={path.startsWith('/projects')} />
      <SidebarLink to="/billing" icon={Receipt} label="Invoice" active={path.startsWith('/billing')} />
    </>
  );
};

export default App;
