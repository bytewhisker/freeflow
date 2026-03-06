import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SidebarItem {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: string;
}

interface SidebarProps {
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
  onSignOut: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const sidebarItems: SidebarItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/projects', icon: Briefcase, label: 'Projects' },
  { to: '/billing', icon: Receipt, label: 'Invoice' },
];

const SidebarLink: React.FC<{
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
  badge?: string;
}> = ({ to, icon: Icon, label, active, badge }) => {
  return (
    <Link
      to={to}
      className={`
        group relative flex items-center gap-3 px-4 py-2.5 transition-all duration-200
        ${active
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-400'
          : 'text-black dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-l-4 hover:border-slate-300 dark:hover:border-slate-600'
        }
      `}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        size={20}
        className={`
          transition-colors duration-200
          ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}
        `}
      />
      <span className="text-base font-medium">{label}</span>
      {badge && (
        <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 text-black dark:text-slate-300 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  userName,
  userAvatar,
  userEmail,
  onSignOut,
  collapsed = false,
  onToggleCollapse
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    onSignOut();
  };

  // Mobile menu
  if (window.innerWidth < 768) {
    return (
      <>
        {/* Mobile header with hamburger */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Briefcase size={16} />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">FreeFlow</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-white dark:bg-slate-900 shadow-xl">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <Briefcase size={16} />
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">FreeFlow</span>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {sidebarItems.map((item) => (
                  <SidebarLink
                    key={item.to}
                    {...item}
                    active={isActive(item.to)}
                  />
                ))}
              </nav>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-black dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all"
                >
                  <Settings size={20} />
                  <span className="text-base font-medium">Settings</span>
                </Link>

                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {userAvatar ? (
                      <img src={userAvatar} alt="User" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      userName?.[0] || userEmail?.[0] || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {userName || userEmail?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {userEmail || 'user@example.com'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all group"
                >
                  <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-base font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className={`
      ${collapsed ? 'w-16' : 'w-64'}
      bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 
      flex flex-col sticky top-0 h-screen shadow-r-lg
      transition-all duration-300 ease-in-out
    `}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Briefcase size={16} />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-slate-900 dark:text-white">FreeFlow</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {sidebarItems.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            active={isActive(item.to)}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
        {/* Settings */}
        <Link
          to="/settings"
          className={`
            group relative flex items-center gap-3 px-4 py-2.5 transition-all duration-200 rounded-lg
            ${location.pathname === '/settings'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-400'
              : 'text-black dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }
          `}
          aria-current={location.pathname === '/settings' ? 'page' : undefined}
        >
          <Settings
            size={20}
            className={`
              transition-colors duration-200
              ${location.pathname === '/settings'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
              }
            `}
          />
          {!collapsed && <span className="text-base font-medium">Settings</span>}
        </Link>

        {/* User info */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
              {userAvatar ? (
                <img src={userAvatar} alt="User" className="w-full h-full rounded-full object-cover" />
              ) : (
                userName?.[0] || userEmail?.[0] || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {userName || userEmail?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {userEmail || 'user@example.com'}
              </p>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className={`
            flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all group
            ${collapsed ? 'justify-center' : ''}
            text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
          `}
        >
          <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          {!collapsed && <span className="text-base font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
