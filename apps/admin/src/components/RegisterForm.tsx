// PagePress v0.0.18 - 2026-03-01
// Registration form component — supports invite tokens

import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { api } from '../lib/api';
import { Button } from './ui/button';

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<{ role: string; email: string | null } | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  
  const { register, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  // Validate invite token on mount
  useEffect(() => {
    if (!inviteToken) return;
    api.invites.validate(inviteToken)
      .then((res) => {
        setInviteInfo({ role: res.invite.role, email: res.invite.email });
        if (res.invite.email) setEmail(res.invite.email);
      })
      .catch(() => {
        setInviteError('This invite link is invalid or has expired.');
      });
  }, [inviteToken]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();
    
    // Client-side validation
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setValidationError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(username, email, password, inviteToken ?? undefined);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error is handled by store
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const displayError = validationError || error || inviteError;
  
  if (inviteError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {inviteError}
        </div>
        <p className="text-center text-sm text-gray-600">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to login
          </Link>
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {displayError && !inviteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {displayError}
        </div>
      )}
      
      {inviteInfo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          You've been invited as <strong>{inviteInfo.role}</strong>.
          {inviteInfo.email && <> Registering for <strong>{inviteInfo.email}</strong>.</>}
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={50}
          autoComplete="username"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="admin"
        />
        <p className="mt-1 text-xs text-gray-500">
          3-50 characters. Letters, numbers, underscores, and hyphens only.
        </p>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          readOnly={!!inviteInfo?.email}
          autoComplete="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="admin@example.com"
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
          minLength={8}
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="••••••••"
        />
        <p className="mt-1 text-xs text-gray-500">
          Minimum 8 characters.
        </p>
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="••••••••"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>
      
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
