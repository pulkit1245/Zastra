import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative glass-card p-6 w-full max-w-md animate-slide-up">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <X className="w-5 h-5 text-surface-500" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-danger-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
