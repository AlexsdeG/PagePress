// PagePress v0.0.3 - 2025-11-30
// Dashboard page (main authenticated view)

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { api, type HealthResponse } from '../lib/api';
import { Button } from '../components/ui/button';

/**
 * Dashboard page component
 */
export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  
  // Fetch health status
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await api.health.check();
        setHealth(data);
      } catch (error) {
        console.error('Failed to fetch health:', error);
      } finally {
        setIsHealthLoading(false);
      }
    };
    
    fetchHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">PagePress</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                v0.0.3
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with PagePress.
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* System Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            </div>
            {isHealthLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : health ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Status:</span>{' '}
                  <span className={health.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                    {health.status === 'ok' ? 'Online' : 'Issues Detected'}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Database:</span>{' '}
                  <span className={health.database.connected ? 'text-green-600' : 'text-red-600'}>
                    {health.database.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-red-500">Failed to load status</p>
            )}
          </div>
          
          {/* User Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Account</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-600">Username:</span>{' '}
                <span className="font-medium">{user?.username}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Email:</span>{' '}
                <span className="font-medium">{user?.email}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Role:</span>{' '}
                <span className="font-medium capitalize">{user?.role}</span>
              </p>
            </div>
          </div>
          
          {/* Memory Usage Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Server Resources</h3>
            {isHealthLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : health ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Heap Used:</span>{' '}
                  <span className="font-medium">
                    {(health.memory.heapUsed / 1024 / 1024).toFixed(2)} MB
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Heap Total:</span>{' '}
                  <span className="font-medium">
                    {(health.memory.heapTotal / 1024 / 1024).toFixed(2)} MB
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">RSS:</span>{' '}
                  <span className="font-medium">
                    {(health.memory.rss / 1024 / 1024).toFixed(2)} MB
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-red-500">Failed to load</p>
            )}
          </div>
        </div>
        
        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
          <h3 className="text-xl font-semibold mb-2">🚀 Coming Soon</h3>
          <p className="text-blue-100 mb-4">
            The visual page builder, content management, and media library are being developed.
            Check the roadmap for progress updates.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Phase 3: Content Models</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Phase 4: Page Builder</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Phase 5: Media Library</span>
          </div>
        </div>
      </main>
    </div>
  );
}
