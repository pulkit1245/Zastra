import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Activity, GitBranch, Swords, Code2 } from 'lucide-react';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useApi } from '../../hooks/useApi';
import { activityService } from '../../services/activityService';

const TABS = [
  { key: 'global', label: 'Global Stats', icon: Activity },
  { key: 'github', label: 'GitHub', icon: GitBranch },
  { key: 'contest', label: 'Contests', icon: Swords },
];

const PIE_COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function ActivityPage() {
  const [tab, setTab] = useState('global');
  const globalStats = useApi(activityService.getGlobalStats);
  const githubStats = useApi(activityService.getGithubStats);
  const contestStats = useApi(activityService.getContestStats);

  useEffect(() => {
    globalStats.execute();
    githubStats.execute();
    contestStats.execute();
  }, []);

  const loading = (tab === 'global' && globalStats.loading && !globalStats.data) ||
                  (tab === 'github' && githubStats.loading && !githubStats.data) ||
                  (tab === 'contest' && contestStats.loading && !contestStats.data);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Activity</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Track your coding journey across platforms.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800/60 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}

      {/* Global Stats Tab */}
      {tab === 'global' && globalStats.data && (
        <GlobalTab data={globalStats.data} />
      )}

      {/* GitHub Tab */}
      {tab === 'github' && githubStats.data && (
        <GithubTab data={githubStats.data} />
      )}

      {/* Contest Tab */}
      {tab === 'contest' && contestStats.data && (
        <ContestTab data={contestStats.data} />
      )}
    </div>
  );
}

function GlobalTab({ data }) {
  const difficultyData = data.difficulty
    ? [
        { name: 'Easy', value: data.difficulty.easy },
        { name: 'Medium', value: data.difficulty.medium },
        { name: 'Hard', value: data.difficulty.hard },
      ]
    : [];

  const platformData = data.platformBreakdown
    ? Object.entries(data.platformBreakdown)
        .filter(([, v]) => v && typeof v === 'object')
        .map(([platform, bd]) => ({
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          easy: bd.easy || 0,
          medium: bd.medium || 0,
          hard: bd.hard || 0,
          total: (bd.easy || 0) + (bd.medium || 0) + (bd.hard || 0),
        }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Code2} label="Total Solved" value={data.totalSolved} color="primary" />
        <StatCard icon={Activity} label="Active Days" value={data.totalActiveDays} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Pie */}
        {difficultyData.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Difficulty Split</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {difficultyData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-surface-800)', border: 'none', borderRadius: '0.75rem', color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Platform Bar */}
        {platformData.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Platform Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
                <XAxis dataKey="platform" tick={{ fill: 'var(--color-surface-500)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-surface-500)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface-800)', border: 'none', borderRadius: '0.75rem', color: '#fff' }} />
                <Bar dataKey="easy" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill="#eab308" />
                <Bar dataKey="hard" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function GithubTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={GitBranch} label="Commits (Last Year)" value={data.commitsLastYear} color="accent" />
        <StatCard icon={Code2} label="Total Repos" value={data.totalRepos} color="primary" />
        <StatCard icon={Activity} label="Total Stars" value={data.totalStars} color="warning" />
      </div>

      {data.topLanguages && data.topLanguages.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Top Languages</h3>
          <div className="flex flex-wrap gap-2">
            {data.topLanguages.map((lang) => (
              <span
                key={lang}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContestTab({ data }) {
  const historyData = data.history?.map((h) => ({
    name: h.contestName?.substring(0, 20) || h.date,
    rank: h.rank,
    platform: h.platform,
  })) || [];

  return (
    <div className="space-y-6">
      <StatCard icon={Swords} label="Total Contests" value={data.totalContests} color="danger" />

      {/* Ratings */}
      {data.ratings && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.ratings.leetcode && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">LeetCode</h3>
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">{data.ratings.leetcode.current}</p>
                  <p className="text-xs text-surface-400">Current Rating</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-success-500">{data.ratings.leetcode.highest}</p>
                  <p className="text-xs text-surface-400">Highest</p>
                </div>
              </div>
            </div>
          )}
          {data.ratings.codeforces && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">Codeforces</h3>
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">{data.ratings.codeforces.current}</p>
                  <p className="text-xs text-surface-400">Current Rating</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-success-500">{data.ratings.codeforces.highest}</p>
                  <p className="text-xs text-surface-400">Highest</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contest History Chart */}
      {historyData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Contest History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-surface-500)', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: 'var(--color-surface-500)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface-800)', border: 'none', borderRadius: '0.75rem', color: '#fff' }} />
              <Line type="monotone" dataKey="rank" stroke="var(--color-primary-500)" strokeWidth={2} dot={{ fill: 'var(--color-primary-500)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History Table */}
      {data.history && data.history.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-surface-200/60 dark:border-surface-700/40">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-800/50">
                  <th className="text-left px-5 py-3 font-semibold text-surface-500 dark:text-surface-400">Platform</th>
                  <th className="text-left px-5 py-3 font-semibold text-surface-500 dark:text-surface-400">Contest</th>
                  <th className="text-left px-5 py-3 font-semibold text-surface-500 dark:text-surface-400">Rank</th>
                  <th className="text-left px-5 py-3 font-semibold text-surface-500 dark:text-surface-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((h, i) => (
                  <tr key={i} className="border-t border-surface-100 dark:border-surface-800/60 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-5 py-3 text-surface-700 dark:text-surface-300 capitalize">{h.platform}</td>
                    <td className="px-5 py-3 text-surface-900 dark:text-surface-100 font-medium">{h.contestName}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold text-xs">
                        #{h.rank}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-surface-500 dark:text-surface-400">{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
