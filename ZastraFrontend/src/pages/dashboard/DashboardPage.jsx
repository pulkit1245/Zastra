import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2, GitBranch, Trophy, Star, TrendingUp, Calendar,
  FolderKanban, Link2, ArrowRight,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { activityService } from '../../services/activityService';
import { gamificationService } from '../../services/gamificationService';
import { projectService } from '../../services/projectService';
import { profileService } from '../../services/profileService';

export default function DashboardPage() {
  const globalStats = useApi(activityService.getGlobalStats);
  const githubStats = useApi(activityService.getGithubStats);
  const gamification = useApi(gamificationService.getSummary);
  const projects = useApi(projectService.getProjects);
  const profile = useApi(profileService.getProfile);

  useEffect(() => {
    globalStats.execute();
    githubStats.execute();
    gamification.execute();
    projects.execute();
    profile.execute();
  }, []);

  // Listen for manual refresh events (e.g., after integrations sync)
  useEffect(() => {
    const handler = () => {
      globalStats.execute();
      githubStats.execute();
      gamification.execute();
    };
    window.addEventListener('activity-updated', handler);
    return () => window.removeEventListener('activity-updated', handler);
  }, [globalStats, githubStats, gamification]);

  const isLoading = globalStats.loading && !globalStats.data;

  if (isLoading) return <LoadingSpinner text="Loading dashboard…" />;

  const gs = globalStats.data;
  const gh = githubStats.data;
  const gm = gamification.data;
  const projCount = projects.data?.length ?? 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-surface-100">
          Welcome back{profile.data?.displayName ? `, ${profile.data.displayName}` : ''} 👋
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Here's an overview of your developer journey.
        </p>
      </div>

      {/* XP Banner */}
      {gm && (
        <div className="glass-card p-6 bg-gradient-to-r from-primary-600/5 via-primary-500/5 to-accent-500/5 dark:from-primary-600/10 dark:via-primary-500/10 dark:to-accent-500/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Current Level</p>
                <p className="text-xl font-bold text-surface-900 dark:text-surface-100">{gm.currentLevel}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Experience Points</p>
              <p className="text-2xl font-bold gradient-text">{gm.totalXp} XP</p>
            </div>
          </div>
          {/* XP Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-surface-400 dark:text-surface-500 mb-1">
              <span>{gm.totalXp} XP</span>
              <span>{gm.nextLevelXp} XP</span>
            </div>
            <div className="h-2.5 bg-surface-200/60 dark:bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min((gm.totalXp / (gm.nextLevelXp || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Code2}
          label="Problems Solved"
          value={gs?.totalSolved ?? 0}
          color="primary"
        />
        <StatCard
          icon={Calendar}
          label="Active Days"
          value={gs?.totalActiveDays ?? 0}
          color="success"
        />
        <StatCard
          icon={GitBranch}
          label="GitHub Repos"
          value={gh?.totalRepos ?? 0}
          color="accent"
        />
        <StatCard
          icon={Star}
          label="GitHub Stars"
          value={gh?.totalStars ?? 0}
          color="warning"
        />
      </div>

      {/* Difficulty Breakdown */}
      {gs?.difficulty && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Difficulty Breakdown
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Easy', value: gs.difficulty.easy, color: 'bg-success-400', bgColor: 'bg-success-400/10' },
              { label: 'Medium', value: gs.difficulty.medium, color: 'bg-warning-400', bgColor: 'bg-warning-400/10' },
              { label: 'Hard', value: gs.difficulty.hard, color: 'bg-danger-400', bgColor: 'bg-danger-400/10' },
            ].map((d) => (
              <div key={d.label} className={`${d.bgColor} rounded-xl p-4 text-center`}>
                <div className={`w-3 h-3 ${d.color} rounded-full mx-auto mb-2`} />
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{d.value}</p>
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400">{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/projects"
          className="glass-card p-5 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-surface-100">Projects</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">{projCount} project{projCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-surface-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/integrations"
          className="glass-card p-5 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-surface-100">Integrations</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Manage platform syncs</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-surface-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
