import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Briefcase,
  Receipt,
  Settings,
  LogOut,
  Wallet,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Sidebar Item Component
const SidebarItem = ({ to, icon: Icon, label, active, onClick }: { to: string; icon: any; label: string; active: boolean; onClick?: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 outline-none
      ${active 
        ? 'bg-blue-50 text-blue-700 font-medium' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    {/* Active Indicator Bar */}
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-blue-600 rounded-r-full" />
    )}

    <Icon size={20} strokeWidth={active ? 2.5 : 2} className={`transition-colors ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
    <span className="text-[15px]">{label}</span>
  </Link>
);

// Separator Component
const Separator = () => <div className="h-px w-full bg-slate-200 my-2" />;

// Main Sidebar Component
const Sidebar = ({ session, state, mobileOpen, setMobileOpen }: { session: any; state: any; mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    if (route === '/') return path === '/';
    return path.startsWith(route);
  };

  const menuItems = [
    { to: '/', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/projects', icon: Briefcase, label: 'Projects' },
    { to: '/billing', icon: Receipt, label: 'Invoice' },
  ];

  const userInitial = state?.settings?.profile?.name?.[0] || session?.user?.email?.[0] || 'U';
  const userName = state?.settings?.profile?.name || session?.user?.email?.split('@')[0] || 'User';
  const userTitle = state?.settings?.profile?.title || 'Freelancer';
  const avatarUrl = state?.settings?.profile?.avatarUrl;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 h-screen w-[260px] bg-[#FAFAFB] border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wallet size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">FreeFlow</span>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={isActive(item.to)}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-3">
           <SidebarItem 
            to="/settings" 
            icon={Settings} 
            label="Settings" 
            active={isActive('/settings')}
            onClick={() => setMobileOpen(false)}
          />

          <Separator />
          
          {/* User Profile */}
          <div className="mt-2 p-2 rounded-xl border border-slate-200 bg-white shadow-sm group hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-semibold text-slate-600 text-sm">{userInitial}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                  {userName}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded tracking-wide uppercase">
                    {userTitle}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => supabase?.auth.signOut()}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
