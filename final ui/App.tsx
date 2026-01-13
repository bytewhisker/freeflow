
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
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
  Settings as SettingsIcon
} from 'lucide-react';
import { db } from './db';
import { AppState } from './types';

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

const SidebarLink = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-gray-200 text-black shadow-lg shadow-blue-100' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(db.getState());
  
  useEffect(() => {
    db.setState(state);
  }, [state]);

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-white">
        <Routes>
          <Route path="/portal/:docId" element={<ClientPortal state={state} />} />
          
          <Route path="/*" element={
            <>
              <aside className="w-64 bg-[#FAF9F7] border-r border-slate-200 flex flex-col sticky top-0 h-screen no-print">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                      <Wallet size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">FreeFlow</span>
                  </div>

                  <nav className="space-y-1">
                    <RouteWrapper />
                  </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-100">
                  <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-100 mb-2">
                    <SettingsIcon size={20} />
                    <span className="font-medium">Settings</span>
                  </Link>
                  <div className="flex items-center gap-3 mb-6 px-4">
                    <img 
                      src="https://picsum.photos/seed/freelancer/40/40" 
                      className="w-10 h-10 rounded-full bg-slate-200"
                      alt="Profile"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Alex Studio</p>
                      <p className="text-xs text-slate-500">Pro Plan</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { if(confirm('Are you sure? This will delete ALL your work.')) db.reset(); }}
                    className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors px-4"
                  >
                    <LogOut size={16} />
                    Reset Data
                  </button>
                </div>
              </aside>

              <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 no-print">
                  <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full w-96">
                    <Search size={18} className="text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="bg-transparent border-none outline-none text-sm w-full text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full relative">
                      <Bell size={20} />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <Link 
                      to="/billing/new" 
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-100"
                    >
                      <Plus size={18} />
                      New Entry
                    </Link>
                  </div>
                </header>

                <div className="p-5 w-full overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard state={state} />} />
                    <Route path="/clients" element={<Clients state={state} setState={setState} />} />
                    <Route path="/clients/:id" element={<ClientDetail state={state} setState={setState} />} />
                    <Route path="/projects" element={<Projects state={state} setState={setState} />} />
                    <Route path="/projects/:id" element={<ProjectDetail state={state} setState={setState} />} />
                    <Route path="/billing" element={<Billing state={state} setState={setState} />} />
                    <Route path="/billing/new" element={<BillingForm state={state} setState={setState} />} />
                    <Route path="/billing/edit/:id" element={<BillingForm state={state} setState={setState} />} />
                    <Route path="/billing/view/:id" element={<BillingDetail state={state} setState={setState} />} />
                    <Route path="/settings" element={<Settings state={state} setState={setState} />} />
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
