import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Code2, GitBranch, Star, Activity, Trophy, ExternalLink, ArrowLeft,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';
import ThemeToggle from '../../components/ThemeToggle';
import { useApi } from '../../hooks/useApi';
import { portfolioService } from '../../services/portfolioService';

const PIE_COLORS = ['#6366f1', '#22d3ee', '#22c55e', '#eab308', '#ef4444', '#f97316', '#8b5cf6', '#ec4899'];

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const portfolio = useApi(portfolioService.getPublicPortfolio);

  useEffect(() => {
    portfolio.execute(username);
  }, [username]);

  if (portfolio.loading && !portfolio.data) return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
      <LoadingSpinner text={`Loading ${username}'s portfolio…`} />
    </div>
  );

  if (portfolio.error) return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
      <EmptyState
        title="Portfolio not found"
        description={`No portfolio exists for "${username}".`}
        action={<Link to="/directory" className="btn-primary">Browse Directory</Link>}
      />
    </div>
  );

  const d = portfolio.data;
  if (!d) return null;

  const topicData = d.topics
    ? Object.entries(d.topics).map(([name, value]) => ({ name, value })).slice(0, 8)
    : [];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass border-b border-surface-200/60 dark:border-surface-700/40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/directory" className="flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Directory
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Profile Header */}
        <div className="glass-card p-6 sm:p-8">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20 text-2xl font-bold text-white">
              {username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100">
                {d.profile?.displayName || username}
              </h1>
              {d.profile?.bio && (
                <p className="text-surface-500 dark:text-surface-400 mt-2 max-w-2xl">{d.profile.bio}</p>
              )}
              {d.profile?.targetRoles?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {d.profile.targetRoles.map((r) => (
                    <span key={r} className="px-3 py-1 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              )}
              {d.gamification?.level && (
                <div className="flex items-center gap-2 mt-3">
                  <Trophy className="w-4 h-4 text-warning-400" />
                  <span className="text-sm font-medium text-surface-600 dark:text-surface-300">{d.gamification.level}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {d.aiSummary && (
          <div className="glass-card p-6 bg-gradient-to-r from-primary-600/5 to-accent-500/5 dark:from-primary-600/10 dark:to-accent-500/10">
            <h2 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">AI Summary</h2>
            <p className="text-surface-700 dark:text-surface-300 leading-relaxed">{d.aiSummary}</p>
          </div>
        )}

        {/* Stats */}
        {d.globalStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={Code2} label="Total Solved" value={d.globalStats.totalSolved} color="primary" />
            <StatCard icon={Activity} label="Active Days" value={d.globalStats.totalActiveDays} color="success" />
            <StatCard icon={GitBranch} label="GitHub Repos" value={d.github?.totalRepos} color="accent" />
            <StatCard icon={Star} label="Stars" value={d.github?.totalStars} color="warning" />
          </div>
        )}

        {/* Topics */}
        {topicData.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Topics</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={topicData} cx="50%" cy="50%" outerRadius={110} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {topicData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-surface-800)', border: 'none', borderRadius: '0.75rem', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Languages */}
        {d.github?.topLanguages?.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">Top Languages</h2>
            <div className="flex flex-wrap gap-2">
              {d.github.topLanguages.map((lang) => (
                <span key={lang} className="px-4 py-2 rounded-xl text-sm font-medium bg-accent-500/10 text-accent-600 dark:text-accent-400 border border-accent-500/20">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {d.manualProjects?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {d.manualProjects.map((p) => (
                <div key={p.id} className="glass-card p-5">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">{p.title}</h3>
                  {p.description && (
                    <p className="text-sm text-surface-500 dark:text-surface-400 mb-3 line-clamp-2">{p.description}</p>
                  )}
                  {p.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.techStack.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400">{t}</span>
                      ))}
                    </div>
                  )}
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
