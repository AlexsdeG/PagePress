// PagePress v0.0.18 - 2026-03-01
// First-time setup page — creates admin account and site name

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SetupPage() {
  const [siteName, setSiteName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username, email, password, undefined, siteName || undefined);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Setup failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to PagePress</CardTitle>
          <CardDescription>
            Set up your site by creating your admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="My Website"
                maxLength={100}
              />
              <p className="mt-1 text-xs text-gray-500">Optional. You can change this later in Settings.</p>
            </div>

            <hr />

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={50}
                autoComplete="username"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
