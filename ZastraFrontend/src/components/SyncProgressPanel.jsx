import { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle2, Loader2, XCircle, X } from 'lucide-react';
import { activityService } from '../services/activityService';
import { gamificationService } from '../services/gamificationService';

// ── helpers ─────────────────────────────────────────────────────────────────
// Returns true only when the API response has meaningful (non-zero) data
function hasRealData(key, data) {
  if (!data) return false;
  switch (key) {
    case 'global':  return data.totalSolved > 0 || data.totalActiveDays > 0;
    case 'github':  return data.totalRepos > 0 || data.totalStars > 0;
    case 'contest': return data.totalContests > 0;
    case 'heatmap': return Array.isArray(data) && data.length > 0;
    case 'gamify':  return data.totalXp > 0;
    default:        return true;
  }
}

const STEPS = [
  { key: 'global',  label: 'Problem Stats',    icon: '🧩', fn: activityService.getGlobalStats  },
  { key: 'github',  label: 'GitHub Data',      icon: '🐙', fn: activityService.getGithubStats  },
  { key: 'contest', label: 'Contest Ratings',  icon: '🏆', fn: activityService.getContestStats },
  { key: 'heatmap', label: 'Activity Heatmap', icon: '📅', fn: activityService.getHeatmap      },
  { key: 'gamify',  label: 'Gamification XP',  icon: '⚡', fn: gamificationService.getSummary  },
];

const MAX_POLLS = 12;    // max retry attempts per endpoint
const POLL_MS   = 4000;  // ms between retries
const S         = { idle: 'idle', loading: 'loading', done: 'done', error: 'error' };

/**
 * SyncProgressPanel
 *
 * Polls each activity endpoint every 4 s until it gets real (non-zero) data,
 * then marks it ✅. Renders a floating bottom-right card with per-step progress.
 *
 * Props:
 *   onComplete(results) — called when all steps are done/errored
 *   onDismiss()         — called when user clicks ✕
 */
export default function SyncProgressPanel({ onComplete, onDismiss }) {
  const [steps, setSteps] = useState(() =>
    STEPS.map((s) => ({ key: s.key, label: s.label, icon: s.icon, status: S.idle, elapsed: null, attempts: 0 }))
  );
  const [allDone, setAllDone]   = useState(false);
  const startTime = useRef(Date.now());
  const endTime   = useRef(null);
  const results   = useRef({});
  const cancelled = useRef(false);

  const mark = useCallback((idx, patch) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))), []);

  const pollStep = useCallback(async (idx) => {
    const step = STEPS[idx];
    mark(idx, { status: S.loading });
    const t0 = Date.now();

    for (let attempt = 1; attempt <= MAX_POLLS; attempt++) {
      if (cancelled.current) return;

      try {
        const res  = await step.fn();
        const data = res?.data ?? res;
        const syncStatus = res?.headers?.['x-sync-status'];

        if (syncStatus === 'COMPLETED' || hasRealData(step.key, data)) {
          results.current[step.key] = data;
          mark(idx, { status: S.done, elapsed: ((Date.now() - t0) / 1000).toFixed(1), attempts: attempt });
          return;
        }
        // Got zeros — backend still scraping; wait and retry
        mark(idx, { attempts: attempt });
      } catch {
        mark(idx, { attempts: attempt });
      }

      await new Promise((r) => setTimeout(r, POLL_MS));
    }

    // All retries exhausted
    mark(idx, { status: S.error, elapsed: ((Date.now() - t0) / 1000).toFixed(1) });
  }, [mark]);

  useEffect(() => {
    cancelled.current = false;

    Promise.all(STEPS.map((_, i) => pollStep(i))).then(() => {
      if (!cancelled.current) {
        endTime.current = Date.now();
        setAllDone(true);
        onComplete?.(results.current);
      }
    });

    return () => { cancelled.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doneCount   = steps.filter((s) => s.status === S.done || s.status === S.error).length;
  const progressPct = Math.round((doneCount / STEPS.length) * 100);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 animate-slide-up">
      <div className="glass-card p-5 shadow-2xl border border-primary-500/20">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {allDone
              ? <CheckCircle2 className="w-4 h-4 text-success-500" />
              : <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
            }
            <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              {allDone ? 'Sync Complete ✅' : 'Waiting for data…'}
            </span>
          </div>
          {allDone && (
            <button onClick={onDismiss} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Overall progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-surface-400 mb-1">
            <span>{doneCount}/{STEPS.length} complete</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full gradient-bg rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Per-step rows */}
        <div className="space-y-2.5">
          {steps.map((step) => (
            <div key={step.key} className="flex items-center gap-2.5">
              <div className="w-5 flex-shrink-0 flex justify-center">
                {step.status === S.idle    && <div className="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-600" />}
                {step.status === S.loading && <Loader2 className="w-3.5 h-3.5 text-primary-500 animate-spin" />}
                {step.status === S.done    && <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />}
                {step.status === S.error   && <XCircle className="w-3.5 h-3.5 text-danger-400" />}
              </div>

              <span className="text-xs flex-1 text-surface-700 dark:text-surface-300">
                {step.icon} {step.label}
              </span>

              {step.status === S.loading && step.attempts > 0 && (
                <span className="text-xs text-surface-400 tabular-nums">
                  try {step.attempts}/{MAX_POLLS}
                </span>
              )}
              {step.elapsed && (
                <span className="text-xs text-surface-400 tabular-nums">{step.elapsed}s</span>
              )}
              {step.status === S.error && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-danger-400/10 text-danger-400 font-medium">
                  timeout
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-3 pt-3 border-t border-surface-200/50 dark:border-surface-700/50 text-xs text-surface-400 text-center">
          {allDone && endTime.current
            ? `Completed in ${((endTime.current - startTime.current) / 1000).toFixed(1)}s`
            : 'Polling every 4s · scraper is fetching live data'}
        </p>
      </div>
    </div>
  );
}
