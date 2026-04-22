import { useEffect, useState } from 'react';
import {
  RefreshCw, Link2, CheckCircle2, XCircle, Clock, AlertCircle,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useApi } from '../../hooks/useApi';
import { integrationService } from '../../services/integrationService';
import { formatDateTime, capitalize } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PLATFORM_COLORS = {
  github: { bg: 'bg-surface-900 dark:bg-white', text: 'text-white dark:text-surface-900' },
  leetcode: { bg: 'bg-orange-500', text: 'text-white' },
  codeforces: { bg: 'bg-blue-600', text: 'text-white' },
  codechef: { bg: 'bg-yellow-600', text: 'text-white' },
  gfg: { bg: 'bg-green-600', text: 'text-white' },
};

const STATUS_STYLES = {
  SYNCED: { icon: CheckCircle2, color: 'text-success-500', label: 'Synced' },
  SYNCING: { icon: RefreshCw, color: 'text-primary-500 animate-spin', label: 'Syncing…' },
  ERROR: { icon: XCircle, color: 'text-danger-500', label: 'Error' },
  NEVER_SYNCED: { icon: Clock, color: 'text-surface-400', label: 'Never Synced' },
};

export default function IntegrationsPage() {
  const integrations = useApi(integrationService.getStatuses);
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncModals, setSyncModals] = useState({});

  useEffect(() => {
    integrations.execute();
  }, []);

  const handleSyncPlatform = async (platform) => {
    const username = syncModals[platform];
    if (!username?.trim()) {
      toast.error('Please enter a username');
      return;
    }
    setSyncingPlatform(platform);
    try {
      const res = await integrationService.syncPlatform(platform, { username: username.trim() });
      toast.success(res.data.message || `${capitalize(platform)} synced!`);
      integrations.execute();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to sync ${platform}`);
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await integrationService.syncAll();
      toast.success(res.data.message || 'All platforms synced!');
      integrations.execute();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sync all platforms');
    } finally {
      setSyncingAll(false);
    }
  };

  if (integrations.loading && !integrations.data) return <LoadingSpinner text="Loading integrations…" />;

  const list = integrations.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Integrations</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Connect and sync your coding platforms.</p>
        </div>
        <button
          onClick={handleSyncAll}
          disabled={syncingAll}
          className="btn-primary"
        >
          <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
          {syncingAll ? 'Syncing…' : 'Sync All'}
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No integrations found"
          description="Your connected platforms will appear here once synced."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((integration) => {
            const status = STATUS_STYLES[integration.status] || STATUS_STYLES.NEVER_SYNCED;
            const StatusIcon = status.icon;
            const colors = PLATFORM_COLORS[integration.platform?.toLowerCase()] || { bg: 'bg-surface-600', text: 'text-white' };
            const isSyncing = syncingPlatform === integration.platform;

            return (
              <div key={integration.platform} className="glass-card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text} font-bold text-sm`}>
                      {integration.platform?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-surface-100 capitalize">
                        {integration.platform}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                        <span className="text-xs text-surface-500 dark:text-surface-400">{status.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {integration.lastSynced && (
                  <p className="text-xs text-surface-400 dark:text-surface-500 mb-3">
                    Last synced: {formatDateTime(integration.lastSynced)}
                  </p>
                )}

                {/* Sync form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={syncModals[integration.platform] || ''}
                    onChange={(e) =>
                      setSyncModals({ ...syncModals, [integration.platform]: e.target.value })
                    }
                    className="input-field flex-1"
                    placeholder={`${capitalize(integration.platform)} username`}
                  />
                  <button
                    onClick={() => handleSyncPlatform(integration.platform)}
                    disabled={isSyncing}
                    className="btn-primary px-4 flex-shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
