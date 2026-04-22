import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      <div className="text-center animate-slide-up">
        <div className="w-20 h-20 rounded-2xl bg-danger-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-danger-500" />
        </div>
        <h1 className="text-6xl font-bold gradient-text mb-2">404</h1>
        <p className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
          Page Not Found
        </p>
        <p className="text-surface-500 dark:text-surface-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
