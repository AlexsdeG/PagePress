// PagePress v0.0.2 - 2025-11-30

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  database: 'connected' | 'disconnected';
  uptime: number;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('http://localhost:3000/health');
        if (!response.ok) throw new Error('API not responding');
        const data = await response.json() as HealthStatus;
        setHealth(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            PagePress
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visual Site Builder Admin Panel
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Checking API...</span>
            </div>
          ) : error ? (
            <div className="flex items-center text-destructive py-4">
              <XCircle className="h-5 w-5 mr-2" />
              <span>API Error: {error}</span>
            </div>
          ) : health ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">API Status</span>
                <div className="flex items-center">
                  {health.status === 'ok' ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={health.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                    {health.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database</span>
                <span className={health.database === 'connected' ? 'text-green-600' : 'text-red-600'}>
                  {health.database}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono text-sm">v{health.version}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-mono text-sm">
                  {Math.floor(health.uptime)}s
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button variant="default">
            Go to Dashboard
          </Button>
          <Button variant="outline">
            Documentation
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Phase 1: Foundation & Infrastructure ✓
        </p>
      </div>
    </div>
  );
}

export default App;

