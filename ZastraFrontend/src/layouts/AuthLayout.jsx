import { Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950 transition-colors">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuMTMgMCAyLjA1Ljk5IDIuMDUgMi4xOHYxOS42NEMyOC4wNSAzOS45NSAyNy4xMyA0MSAzNiA0MXMyLjA1LTEuMDUgMi4wNS0yLjE4VjIwLjE4QTIuMDcgMi4wNyAwIDAgMCAzNiAxOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl">
            <Zap className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Zastra</h1>
          <p className="text-lg text-white/80 text-center max-w-md leading-relaxed">
            Your unified developer portfolio. Aggregate skills across GitHub, LeetCode, Codeforces, and more.
          </p>
          <div className="flex gap-3 mt-8">
            {['GitHub', 'LeetCode', 'Codeforces', 'CodeChef', 'GFG'].map((p) => (
              <span key={p} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form area */}
      <div className="flex-1 flex flex-col">
        {/* Header with theme toggle */}
        <div className="flex items-center justify-between p-4 lg:p-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Zastra</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md animate-slide-up">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
