// PagePress v0.0.18 - 2026-03-01
// User profile page — update username, email, password

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, checkAuth } = useAuthStore();

  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data: Record<string, string> = {};
      if (username !== user?.username) data.username = username;
      if (email !== user?.email) data.email = email;
      if (Object.keys(data).length === 0) {
        toast.info('No changes to save');
        setSavingProfile(false);
        return;
      }
      await api.auth.updateProfile(data);
      await checkAuth();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.auth.updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <CardTitle>{user?.username}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <Badge variant="secondary" className="mt-1">{user?.role}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your username or email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={50} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password. You'll need your current password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Account ID</dt>
            <dd className="font-mono text-xs">{user?.id}</dd>
            <dt className="text-muted-foreground">Role</dt>
            <dd>{user?.role}</dd>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
