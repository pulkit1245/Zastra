import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  FolderKanban,
  Link2,
  UserCircle,
  Trophy,
  Globe,
  X,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/integrations', icon: Link2, label: 'Integrations' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
  { to: '/gamification', icon: Trophy, label: 'Gamification' },
];

const publicItems = [
  { to: '/directory', icon: Globe, label: 'Directory' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 
          bg-white/90 dark:bg-surface-900/95 backdrop-blur-xl
          border-r border-surface-200/60 dark:border-surface-800/60
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-surface-200/60 dark:border-surface-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Zastra</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-2">
            Main
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {item.label}
            </NavLink>
          ))}

          <div className="my-4 border-t border-surface-200/60 dark:border-surface-800/60" />

          <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-2">
            Public
          </p>
          {publicItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-200/60 dark:border-surface-800/60">
          <div className="flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
            <span className="text-xs text-surface-400 dark:text-surface-500">DevForge v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
