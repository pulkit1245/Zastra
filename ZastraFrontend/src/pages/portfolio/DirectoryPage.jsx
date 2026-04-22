import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Search, Code2, Users } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ThemeToggle from '../../components/ThemeToggle';
import { useApi } from '../../hooks/useApi';
import { portfolioService } from '../../services/portfolioService';

export default function DirectoryPage() {
  const directory = useApi(portfolioService.getDirectory);
  const [search, setSearch] = useState('');

  useEffect(() => {
    directory.execute();
  }, []);

  const list = directory.data || [];
  const filtered = search
    ? list.filter(
        (e) =>
          e.username?.toLowerCase().includes(search.toLowerCase()) ||
          e.displayName?.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass border-b border-surface-200/60 dark:border-surface-700/40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary-500" />
            <span className="font-bold gradient-text">Zastra Directory</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        {/* Hero */}
        <div className="text-center py-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-surface-100">
            Developer Directory
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2 max-w-lg mx-auto">
            Discover talented developers and explore their coding portfolios.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by name or username…"
          />
        </div>

        {directory.loading && !directory.data ? (
          <LoadingSpinner text="Loading directory…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'No developers found' : 'Directory is empty'}
            description={search ? 'Try a different search term.' : 'Be the first to create a portfolio!'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((entry) => (
              <Link
                key={entry.username}
                to={`/portfolio/${entry.username}`}
                className="glass-card p-5 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg group-hover:shadow-primary-500/20 transition-shadow">
                    {entry.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-surface-900 dark:text-surface-100 truncate">
                      {entry.displayName || entry.username}
                    </p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">@{entry.username}</p>
                  </div>
                </div>

                {entry.title && (
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-3 line-clamp-1">{entry.title}</p>
                )}

                <div className="flex items-center gap-1.5 text-sm">
                  <Code2 className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold text-surface-700 dark:text-surface-300">{entry.totalSolved}</span>
                  <span className="text-surface-400 dark:text-surface-500">problems solved</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
