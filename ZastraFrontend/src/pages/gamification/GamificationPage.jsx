import { useEffect } from 'react';
import { Trophy, Medal, Zap, Crown, Award } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useApi } from '../../hooks/useApi';
import { gamificationService } from '../../services/gamificationService';

export default function GamificationPage() {
  const summary = useApi(gamificationService.getSummary);
  const leaderboard = useApi(gamificationService.getLeaderboard);

  useEffect(() => {
    summary.execute();
    leaderboard.execute();
  }, []);

  const isLoading = (summary.loading && !summary.data);

  if (isLoading) return <LoadingSpinner text="Loading gamification…" />;

  const s = summary.data;
  const lb = leaderboard.data || [];

  const rankIcons = [Crown, Medal, Award];
  const rankColors = ['text-yellow-400', 'text-surface-400', 'text-amber-600'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Gamification</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Level up by solving problems and contributing code.</p>
      </div>

      {/* XP Card */}
      {s && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Current Level</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{s.currentLevel}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-bold gradient-text">{s.totalXp}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Total XP</p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-surface-400 dark:text-surface-500 mb-1.5">
              <span>Progress to next level</span>
              <span>{s.totalXp} / {s.nextLevelXp} XP</span>
            </div>
            <div className="h-3 bg-surface-200/60 dark:bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min((s.totalXp / (s.nextLevelXp || 1)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-surface-400 mt-1.5">
              {Math.max(0, (s.nextLevelXp || 0) - s.totalXp)} XP to next level
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-surface-200/60 dark:border-surface-700/40">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-500" />
            Leaderboard
          </h2>
        </div>

        {lb.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Trophy} title="Leaderboard is empty" description="Start solving problems to appear here!" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-800/50">
                  <th className="text-left px-5 py-3 font-semibold text-surface-500 dark:text-surface-400 w-16">Rank</th>
                  <th className="text-left px-5 py-3 font-semibold text-surface-500 dark:text-surface-400">Developer</th>
                  <th className="text-left px-5 py-3 font-semibold text-surface-500 dark:text-surface-400">XP</th>
                  <th className="text-left px-5 py-3 font-semibold text-surface-500 dark:text-surface-400">Top Language</th>
                </tr>
              </thead>
              <tbody>
                {lb.map((entry, i) => {
                  const RankIcon = rankIcons[i] || null;
                  const rankColor = rankColors[i] || '';

                  return (
                    <tr
                      key={entry.rank}
                      className={`border-t border-surface-100 dark:border-surface-800/60 transition-colors
                        ${i < 3 ? 'bg-primary-500/[0.02] dark:bg-primary-500/[0.03]' : 'hover:bg-surface-50 dark:hover:bg-surface-800/30'}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {RankIcon ? (
                            <RankIcon className={`w-5 h-5 ${rankColor}`} />
                          ) : (
                            <span className="text-surface-500 dark:text-surface-400 font-medium">
                              #{entry.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-surface-900 dark:text-surface-100">
                        {entry.username}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold gradient-text">{entry.xp} XP</span>
                      </td>
                      <td className="px-5 py-3">
                        {entry.topLanguage ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400">
                            {entry.topLanguage}
                          </span>
                        ) : (
                          <span className="text-surface-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
