import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Briefcase,
  Receipt,
  Settings,
  LogOut,
  Wallet,
  X,
  Sun,
  Moon,
  ChevronUp,
  UserCircle2,
  Star,
  Bell
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Sidebar Item Component
const SidebarItem = ({ to, icon: Icon, label, active, onClick }: { to: string; icon: any; label: string; active: boolean; onClick?: () => void; key?: string }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg outline-none
      ${active
        ? 'bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold shadow-sm border border-slate-200 dark:border-slate-700'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
    )}
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className={`${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-black dark:group-hover:text-slate-300'}`} />
    <span className="text-[15px]">{label}</span>
  </Link>
);

// Dark Mode Toggle Component
const ThemeToggle = ({ isDarkMode, toggleDarkMode }: { isDarkMode: boolean; toggleDarkMode: () => void }) => (
  <button
    onClick={toggleDarkMode}
    className="flex items-center gap-3 px-3 py-2.5 rounded-lg outline-none w-full text-black dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
  >
    {isDarkMode ? (
      <>
        <Sun size={20} className="text-amber-500" />
        <span className="text-[15px]">Light Mode</span>
      </>
    ) : (
      <>
        <Moon size={20} className="text-slate-400" />
        <span className="text-[15px]">Dark Mode</span>
      </>
    )}
  </button>
);

// Separator Component
const Separator = () => <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2" />;

// Main Sidebar Component
const Sidebar = ({ session, state, mobileOpen, setMobileOpen, isDarkMode, toggleDarkMode, setNotificationsPanelOpen }: { session: any; state: any; mobileOpen: boolean; setMobileOpen: (open: boolean) => void; isDarkMode: boolean; toggleDarkMode: () => void; setNotificationsPanelOpen: (open: boolean) => void }) => {
  const location = useLocation();
  const path = location.pathname;
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = state?.notifications?.filter((n: any) => !n.read).length || 0;

  // Close profile menu on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [profileMenuOpen]);

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
  const avatarUrl = state?.settings?.profile?.avatarUrl;
  const isPro = state?.settings?.profile?.plan === 'pro';

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
        className={`fixed md:sticky top-0 inset-y-0 h-full h-[100dvh] md:h-screen w-[260px] bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wallet size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-black dark:text-white">FreeFlow</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-black dark:hover:text-slate-300"
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
        <div className="p-3 pb-6 md:pb-3">
          {/* Upgrade Card — only show for free plan users */}
          {!isPro && (
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/10 group overflow-hidden relative">
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/10">PRO</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">Upgrade to Pro</h4>
                  <p className="text-xs text-blue-100/80 mt-0.5 leading-relaxed">
                    Unlock unlimited projects & clients.
                  </p>
                </div>
              </div>
            </Link>
          )}

          <button
            onClick={() => { setNotificationsPanelOpen(true); setMobileOpen(false); }}
            className="w-full group relative flex items-center justify-between px-3 py-2.5 rounded-lg outline-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-1"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell size={20} strokeWidth={2} className="text-slate-400 dark:text-slate-500 group-hover:text-black dark:group-hover:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="hidden md:block absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-slate-50 dark:border-slate-900" />
                )}
              </div>
              <span className="text-[15px]">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="flex md:hidden items-center justify-center w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="hidden md:flex items-center justify-center w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <SidebarItem
            to="/settings"
            icon={Settings}
            label="Settings"
            active={isActive('/settings')}
            onClick={() => setMobileOpen(false)}
          />

          <Separator />

          <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

          <Separator />

          {/* ─── Profile / Power Button Area ─── */}
          <div ref={profileRef} className="relative">

            {/* Popup Menu — slides up like Windows power menu */}
            {profileMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/70 dark:shadow-black/50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-150 z-10">

                {/* Menu Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account</p>
                </div>

                {/* View Profile */}
                <Link
                  to="/settings"
                  onClick={() => { setProfileMenuOpen(false); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <UserCircle2 size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Profile & Settings</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">{session?.user?.email}</p>
                  </div>
                </Link>

                {/* Divider */}
                <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />

                {/* Sign Out */}
                <button
                  onClick={() => { setProfileMenuOpen(false); supabase?.auth.signOut(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
                    <LogOut size={15} className="text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                  <span className="text-sm font-bold text-rose-500 dark:text-rose-400">Sign Out</span>
                </button>
              </div>
            )}

            {/* Profile Button — click to toggle */}
            <button
              onClick={() => setProfileMenuOpen(prev => !prev)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${profileMenuOpen
                ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 shadow-md shadow-blue-100/50 dark:shadow-black/30'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
            >
              {/* Avatar */}
              <div className={`relative shrink-0 ${isPro ? 'p-[2px] rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-lg shadow-blue-500/30' : ''}`}>
                {isPro && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 animate-pulse opacity-40 blur-sm" />
                )}
                <div className={`relative w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center ${isPro ? 'border-2 border-white dark:border-slate-900' : 'border-2 border-white dark:border-slate-700 shadow-sm'}`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-slate-600 dark:text-slate-300 text-sm">{userInitial.toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 leading-tight">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {userName}
                  </p>
                  {/* Plan Badge */}
                  {isPro ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full border border-blue-300 dark:border-blue-700 shadow-sm shadow-blue-500/20">
                      <Star size={8} className="text-white" fill="white" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">PRO</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border border-amber-200 dark:border-amber-700 shadow-sm">
                      <Star size={8} className="text-white" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Free</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {session?.user?.email}
                </p>
              </div>

              {/* Chevron indicator */}
              <ChevronUp
                size={15}
                className={`text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
