import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ActivityPage from './pages/activity/ActivityPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import IntegrationsPage from './pages/integrations/IntegrationsPage';
import ProfilePage from './pages/profile/ProfilePage';
import GamificationPage from './pages/gamification/GamificationPage';

// Public pages
import PublicPortfolioPage from './pages/portfolio/PublicPortfolioPage';
import DirectoryPage from './pages/portfolio/DirectoryPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/gamification" element={<GamificationPage />} />
            </Route>

            {/* Public routes */}
            <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />
            <Route path="/directory" element={<DirectoryPage />} />

            {/* Redirects & fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-surface-800)',
                color: 'var(--color-surface-100)',
                borderRadius: '0.75rem',
                padding: '12px 16px',
                fontSize: '0.875rem',
                border: '1px solid var(--color-surface-700)',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
