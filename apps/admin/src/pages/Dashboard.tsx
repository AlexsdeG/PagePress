// PagePress v0.0.4 - 2025-11-30
// Dashboard page (main authenticated view)

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { api, type HealthResponse } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Dashboard page component
 */
export function DashboardPage() {
  const { user } = useAuthStore();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  const [stats, setStats] = useState<{ pages: number; media: number }>({ pages: 0, media: 0 });
  
  // Fetch health status and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthData, pagesData, mediaData] = await Promise.all([
          api.health.check(),
          api.pages.list({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
          api.media.list({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        ]);
        setHealth(healthData);
        setStats({
          pages: pagesData.pagination.total,
          media: mediaData.pagination.total,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsHealthLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your PagePress installation.
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pages</CardDescription>
            <CardTitle className="text-3xl">{stats.pages}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/pages" className="text-sm text-primary hover:underline">
              Manage pages →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Media Files</CardDescription>
            <CardTitle className="text-3xl">{stats.media}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/media" className="text-sm text-primary hover:underline">
              Media library →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>System Status</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {isHealthLoading ? (
                <span className="text-muted-foreground">...</span>
              ) : (
                <>
                  <span className={`w-3 h-3 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {health?.status === 'ok' ? 'Online' : 'Error'}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-muted-foreground">
              Database: {health?.database.connected ? 'Connected' : 'Disconnected'}
            </span>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Role</CardDescription>
            <CardTitle className="text-3xl capitalize">{user?.role}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/settings" className="text-sm text-primary hover:underline">
              Site settings →
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/pages"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium">Create New Page</p>
                <p className="text-sm text-muted-foreground">Add content to your website</p>
              </div>
            </Link>
            <Link
              to="/media"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl">🖼️</span>
              <div>
                <p className="font-medium">Upload Media</p>
                <p className="text-sm text-muted-foreground">Add images and files</p>
              </div>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-medium">Configure Settings</p>
                <p className="text-sm text-muted-foreground">Customize your site</p>
              </div>
            </Link>
          </CardContent>
        </Card>
        
        {/* Server Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Server Resources</CardTitle>
            <CardDescription>
              Memory usage and system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isHealthLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : health ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Heap Used</span>
                    <span>{(health.memory.heapUsed / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(health.memory.heapUsed / health.memory.heapTotal) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Heap Total</p>
                    <p className="font-medium">{(health.memory.heapTotal / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RSS</p>
                    <p className="font-medium">{(health.memory.rss / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-destructive">Failed to load server stats</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Roadmap Preview */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardHeader>
          <CardTitle className="text-white">🚀 Coming Soon</CardTitle>
          <CardDescription className="text-blue-100">
            The visual page builder is in development. Stay tuned for updates!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">✅ Phase 3: Dashboard & CMS</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">📋 Phase 4: Page Builder</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">📋 Phase 5: Renderer</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
