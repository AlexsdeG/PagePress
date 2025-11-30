// PagePress v0.0.5 - 2025-11-30

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/auth';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { Pages } from './pages/Pages';
import { MediaPage } from './pages/Media';
import { Settings } from './pages/Settings';
import { BuilderPage } from './pages/Builder';
import { Button } from './components/ui/button';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

/**
 * Auth initializer component
 * Checks authentication status on app mount
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return <>{children}</>;
}

/**
 * Navigation item data
 */
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/pages', label: 'Pages', icon: '📄' },
  { path: '/media', label: 'Media', icon: '🖼️' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
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
        </nav>
        
        {/* User section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
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
 * Main App component with routing
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            {/* Public routes - redirect to dashboard if authenticated */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />
            
            {/* Protected routes - require authentication */}
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pages" element={<Pages />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* Builder route - full screen, no sidebar */}
            <Route
              path="/pages/:id/edit"
              element={
                <ProtectedRoute>
                  <BuilderPage />
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

