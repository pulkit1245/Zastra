import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
      <Loader2 className={`${sizeMap[size]} text-primary-500 animate-spin`} />
      {text && (
        <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">{text}</p>
      )}
    </div>
  );
}
