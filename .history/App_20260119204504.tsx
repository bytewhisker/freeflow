
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
import Sidebar from './components/Sidebar';
import './styles/sidebar.css';


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
              <Sidebar
                userName={state.settings.profile?.name}
                userAvatar={state.settings.profile?.avatarUrl}
                userEmail={session.user.email}
                onSignOut={() => supabase?.auth.signOut()}
              />

              <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10 no-print">
                  <div className="flex items-center gap-4 bg-slate-100/50 px-6 py-3 rounded-2xl w-[400px] border border-transparent focus-within:border-blue-500/20 focus-within:bg-white transition-all">
                    <Search size={18} className="text-slate-400" />
                    <input type="text" placeholder="Quick find clients, projects..." className="bg-transparent border-none outline-none text-sm w-full text-slate-900 font-medium" />
                  </div>

                </header>

                <div className="p-6 w-full overflow-y-auto">
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


export default App;
