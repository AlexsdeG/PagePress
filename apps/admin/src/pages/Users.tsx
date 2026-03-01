// PagePress v0.0.18 - 2026-03-01
// Users management page with invite system

import { useState, useEffect, useCallback } from 'react';
import { api, type User, type Invite, type Role } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive' as const;
    case 'editor': return 'default' as const;
    default: return 'secondary' as const;
  }
};

export function UsersPage() {
  const { user: currentUser } = useAuthStore();

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Roles for selects
  const [roles, setRoles] = useState<Role[]>([]);

  // Invites state
  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Create user form
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('editor');

  // Edit user form
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteHours, setInviteHours] = useState('48');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Submitting states
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.users.list({ page: pagination.page, limit: pagination.limit, search: searchQuery || undefined });
      setUsers(res.users);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  const fetchInvites = useCallback(async () => {
    try {
      const res = await api.invites.list();
      setInvites(res.invites);
    } catch {
      // Silently fail — invites may not be available
    } finally {
      setInvitesLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.roles.list();
      setRoles(res.roles);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchInvites();
    fetchRoles();
  }, [fetchInvites, fetchRoles]);

  // Create user
  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await api.users.create({ username: newUsername, email: newEmail, password: newPassword, role: newRole });
      toast.success('User created');
      setCreateOpen(false);
      setNewUsername(''); setNewEmail(''); setNewPassword(''); setNewRole('editor');
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit user
  const handleEdit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const data: Record<string, string> = {};
      if (editUsername !== selectedUser.username) data.username = editUsername;
      if (editEmail !== selectedUser.email) data.email = editEmail;
      if (editRole !== selectedUser.role) data.role = editRole;
      if (editPassword) data.password = editPassword;
      await api.users.update(selectedUser.id, data);
      toast.success('User updated');
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await api.users.delete(selectedUser.id);
      toast.success('User deleted');
      setDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  // Unlock user
  const handleUnlock = async (userId: string) => {
    try {
      await api.users.unlock(userId);
      toast.success('User unlocked');
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unlock user');
    }
  };

  // Create invite
  const handleCreateInvite = async () => {
    setSubmitting(true);
    try {
      const res = await api.invites.create({
        email: inviteEmail || undefined,
        role: inviteRole,
        expiresInHours: parseInt(inviteHours, 10),
      });
      const link = `${window.location.origin}/pp-admin/register?invite=${res.invite.token}`;
      setGeneratedLink(link);
      fetchInvites();
      toast.success('Invite created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create invite');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete invite
  const handleDeleteInvite = async (id: string) => {
    try {
      await api.invites.delete(id);
      toast.success('Invite deleted');
      fetchInvites();
    } catch {
      toast.error('Failed to delete invite');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/pp-admin/register?invite=${token}`;
    navigator.clipboard.writeText(link).then(() => toast.success('Link copied to clipboard'));
  };

  const openEditDialog = (u: User) => {
    setSelectedUser(u);
    setEditUsername(u.username);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditPassword('');
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage users and invitations.</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>

        {/* ─── Users Tab ─── */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="max-w-sm"
            />
            <div className="flex-1" />
            <Button onClick={() => setCreateOpen(true)}>Create User</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found.</TableCell>
                    </TableRow>
                  ) : users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {u.lockedAt ? (
                          <Badge variant="destructive">Locked</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">···</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(u)}>Edit</DropdownMenuItem>
                            {u.lockedAt && (
                              <DropdownMenuItem onClick={() => handleUnlock(u.id)}>Unlock</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              disabled={u.id === currentUser?.id}
                              onClick={() => { setSelectedUser(u); setDeleteOpen(true); }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {users.length} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</Button>
                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── Invites Tab ─── */}
        <TabsContent value="invites" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1" />
            <Button onClick={() => { setInviteOpen(true); setGeneratedLink(null); setInviteEmail(''); setInviteRole('editor'); setInviteHours('48'); }}>
              Create Invite Link
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : invites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invites yet.</TableCell>
                    </TableRow>
                  ) : invites.map((inv) => {
                    const expired = new Date(inv.expiresAt) < new Date();
                    const used = !!inv.usedAt;
                    return (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.email || <span className="text-muted-foreground">Any</span>}</TableCell>
                        <TableCell><Badge variant={roleBadgeVariant(inv.role)}>{inv.role}</Badge></TableCell>
                        <TableCell>
                          {used ? <Badge variant="outline">Used</Badge>
                            : expired ? <Badge variant="destructive">Expired</Badge>
                            : <Badge variant="default">Active</Badge>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!used && !expired && (
                              <Button variant="ghost" size="sm" onClick={() => copyInviteLink(inv.token)}>Copy</Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-destructive"
                              onClick={() => handleDeleteInvite(inv.id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Create User Dialog ─── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new user account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting || !newUsername || !newEmail || !newPassword}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit User Dialog ─── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details for {selectedUser?.username}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete User Dialog ─── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.username}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Create Invite Dialog ─── */}
      <Dialog open={inviteOpen} onOpenChange={(open) => { setInviteOpen(open); if (!open) setGeneratedLink(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invite Link</DialogTitle>
            <DialogDescription>Generate a one-time invite link for a new user.</DialogDescription>
          </DialogHeader>
          {generatedLink ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Share this link with the new user:</p>
              <div className="flex gap-2">
                <Input readOnly value={generatedLink} className="flex-1 text-sm" />
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(generatedLink).then(() => toast.success('Copied'));
                }}>Copy</Button>
              </div>
              <p className="text-xs text-muted-foreground">This link can only be used once.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email (optional)</label>
                <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com" />
                <p className="mt-1 text-xs text-gray-500">If set, only this email can use the invite.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expires In</label>
                <Select value={inviteHours} onValueChange={setInviteHours}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="168">7 days</SelectItem>
                    <SelectItem value="720">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              {generatedLink ? 'Close' : 'Cancel'}
            </Button>
            {!generatedLink && (
              <Button onClick={handleCreateInvite} disabled={submitting}>
                {submitting ? 'Creating...' : 'Generate Link'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
