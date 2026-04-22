export default function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const iconBg = {
    primary: 'bg-primary-500/10 text-primary-500',
    accent: 'bg-accent-500/10 text-accent-500',
    success: 'bg-success-500/10 text-success-500',
    warning: 'bg-warning-500/10 text-warning-500',
    danger: 'bg-danger-500/10 text-danger-500',
  };

  return (
    <div className="glass-card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
