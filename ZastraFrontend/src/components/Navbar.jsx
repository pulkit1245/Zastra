import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onMenuToggle }) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 glass border-b border-surface-200/60 dark:border-surface-700/40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <Menu className="w-5 h-5 text-surface-600 dark:text-surface-300" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="w-px h-8 bg-surface-200 dark:bg-surface-700 mx-1" />

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
