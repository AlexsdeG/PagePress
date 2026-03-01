// PagePress v0.0.18 - 2026-03-01
// Login form component — supports email or username

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { Button } from './ui/button';

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    
    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch {
      // Error is handled by store
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
          Email or Username
        </label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="admin@example.com or admin"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="••••••••"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
      
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          Create one
        </Link>
      </p>
    </form>
  );
}
