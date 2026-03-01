// PagePress v0.0.18 - 2026-03-01

import { useEffect, Suspense, lazy } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate, 
  NavLink, 
  Outlet, 
  useNavigate 
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/auth';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { AppErrorBoundary, RouteErrorBoundary } from './components/ErrorBoundary';
import { Button } from './components/ui/button';

// Lazy-loaded route components
const LoginPage = lazy(() => import('./pages/Login').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/Register').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })));
const Pages = lazy(() => import('./pages/Pages').then(m => ({ default: m.Pages })));
const MediaPage = lazy(() => import('./pages/Media').then(m => ({ default: m.MediaPage })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const BuilderPage = lazy(() => import('./pages/Builder').then(m => ({ default: m.BuilderPage })));
const Templates = lazy(() => import('./pages/Templates').then(m => ({ default: m.Templates })));
const SetupPage = lazy(() => import('./pages/Setup').then(m => ({ default: m.SetupPage })));
const UsersPage = lazy(() => import('./pages/Users').then(m => ({ default: m.UsersPage })));
const RolesPage = lazy(() => import('./pages/Roles').then(m => ({ default: m.RolesPage })));
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const ActivityLogsPage = lazy(() => import('./pages/ActivityLogs').then(m => ({ default: m.ActivityLogsPage })));

/**
 * Suspense fallback for lazy-loaded routes
 */
function PageLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// Create a React Query client with smart retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: (failureCount, error) => {
        // Don't retry on auth errors or rate limiting
        if (error instanceof Error) {
          const status = (error as { status?: number }).status;
          if (status === 401 || status === 403 || status === 429) {
            return false;
          }
        }
        // Retry once for other errors
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Never retry mutations
    },
  },
});

/**
 * Navigation item data
 */
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/pages', label: 'Pages', icon: '📄' },
  { path: '/templates', label: 'Templates', icon: '🧩' },
  { path: '/media', label: 'Media', icon: '🖼️' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const adminNavItems = [
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/roles', label: 'Roles', icon: '🔒' },
  { path: '/activity-logs', label: 'Activity', icon: '📋' },
];

/**
 * Admin layout with sidebar navigation
 */
function AdminLayout() {
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-xl font-bold">📰 PagePress</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Admin-only section */}
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-1 px-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
              </div>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>
        
        {/* User section */}
        <div className="border-t p-4">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 mb-3 rounded-lg px-2 py-1 transition-colors ${
                isActive ? 'bg-muted' : 'hover:bg-muted'
              }`
            }
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </NavLink>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="pl-64">
        <div className="container py-8 px-6 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/**
 * Auth initializer - runs once on app mount
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const initialCheckDone = useAuthStore((state) => state._initialCheckDone);
  
  useEffect(() => {
    if (!initialCheckDone) {
      checkAuth();
    }
  }, [checkAuth, initialCheckDone]);
  
  return <>{children}</>;
}

/**
 * Auth wrapper for protected routes - no longer calls checkAuth
 */
function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

/**
 * Auth wrapper for public-only routes - no longer calls checkAuth
 */
function PublicOnlyRouteWrapper({ children }: { children: React.ReactNode }) {
  return <PublicOnlyRoute>{children}</PublicOnlyRoute>;
}

/**
 * Router configuration using createBrowserRouter for data router features
 */
const router = createBrowserRouter([
  // Setup route — first-time install
  {
    path: '/setup',
    element: <Suspense fallback={<PageLoader />}><SetupPage /></Suspense>,
  },
  // Public routes
  {
    path: '/login',
    element: <PublicOnlyRouteWrapper><Suspense fallback={<PageLoader />}><LoginPage /></Suspense></PublicOnlyRouteWrapper>,
  },
  {
    path: '/register',
    element: <PublicOnlyRouteWrapper><Suspense fallback={<PageLoader />}><RegisterPage /></Suspense></PublicOnlyRouteWrapper>,
  },
  // Protected admin routes with sidebar
  {
    element: <ProtectedRouteWrapper><AdminLayout /></ProtectedRouteWrapper>,
    children: [
      { path: '/dashboard', element: <RouteErrorBoundary><Suspense fallback={<PageLoader />}><DashboardPage /></Suspense></RouteErrorBoundary> },
      { path: '/pages', element: <RouteErrorBoundary><Suspense fallback={<PageLoader />}><Pages /></Suspense></RouteErrorBoundary> },
      { path: '/templates', element: <RouteErrorBoundary><Suspense fallback={<PageLoader />}><Templates /></Suspense></RouteErrorBoundary> },
      { path: '/media', element: <RouteErrorBoundary><Suspense fallback={<PageLoader />}><MediaPage /></Suspense></RouteErrorBoundary> },
      { path: '/settings', element: <RouteErrorBoundary><Suspense fallback={<PageLoader />}><Settings /></Suspense></RouteErrorBoundary> },
      { path: '/profile', element: <RouteErrorBoundary><Suspense fallback={<PageLoader />}><ProfilePage /></Suspense></RouteErrorBoundary> },
      { path: '/users', element: <RouteErrorBoundary><Suspense fallback={<PageLoader />}><UsersPage /></Suspense></RouteErrorBoundary> },
      { path: '/roles', element: <RouteErrorBoundary><Suspense fallback={<PageLoader />}><RolesPage /></Suspense></RouteErrorBoundary> },
      { path: '/activity-logs', element: <RouteErrorBoundary><Suspense fallback={<PageLoader />}><ActivityLogsPage /></Suspense></RouteErrorBoundary> },
    ],
  },
  // Builder route - full screen, no sidebar
  {
    path: '/pages/:id/edit',
    element: <ProtectedRouteWrapper><RouteErrorBoundary><Suspense fallback={<PageLoader />}><BuilderPage /></Suspense></RouteErrorBoundary></ProtectedRouteWrapper>,
  },
  // Default redirect
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  // 404 fallback
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
], {
  basename: '/pp-admin',
});

/**
 * Main App component with routing
 */
function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          <Toaster position="top-right" richColors closeButton />
          <RouterProvider router={router} />
        </AuthInitializer>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;

