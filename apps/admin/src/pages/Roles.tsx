// PagePress v0.0.18 - 2026-03-01
// Roles management page with permission matrix editor

import { useState, useEffect, useCallback } from 'react';
import { api, type Role } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// All permissions grouped by category
const PERMISSION_GROUPS: Record<string, string[]> = {
  Pages: ['pages.create', 'pages.read', 'pages.update', 'pages.delete', 'pages.publish'],
  Media: ['media.upload', 'media.read', 'media.delete'],
  Templates: ['templates.create', 'templates.read', 'templates.update', 'templates.delete'],
  Settings: ['settings.read', 'settings.update'],
  Users: ['users.create', 'users.read', 'users.update', 'users.delete'],
  Roles: ['roles.create', 'roles.read', 'roles.update', 'roles.delete'],
  Invites: ['invites.create', 'invites.read', 'invites.delete'],
  Logs: ['logs.read'],
};

function permissionLabel(perm: string): string {
  const action = perm.split('.')[1];
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPermissions, setFormPermissions] = useState<Record<string, boolean>>({});

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.roles.list();
      setRoles(res.roles);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const openCreate = () => {
    setEditingRole(null);
    setFormName('');
    setFormDescription('');
    // Default all permissions to false
    const perms: Record<string, boolean> = {};
    Object.values(PERMISSION_GROUPS).flat().forEach(p => { perms[p] = false; });
    setFormPermissions(perms);
    setEditorOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDescription(role.description || '');
    // Merge existing permissions with all known permissions
    const perms: Record<string, boolean> = {};
    Object.values(PERMISSION_GROUPS).flat().forEach(p => { perms[p] = !!role.permissions[p]; });
    setFormPermissions(perms);
    setEditorOpen(true);
  };

  const toggleGroupAll = (group: string) => {
    const perms = PERMISSION_GROUPS[group];
    const allOn = perms.every(p => formPermissions[p]);
    setFormPermissions(prev => {
      const next = { ...prev };
      perms.forEach(p => { next[p] = !allOn; });
      return next;
    });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (editingRole) {
        await api.roles.update(editingRole.id, {
          name: formName,
          description: formDescription || null,
          permissions: formPermissions,
        });
        toast.success('Role updated');
      } else {
        await api.roles.create({
          name: formName,
          description: formDescription || undefined,
          permissions: formPermissions,
        });
        toast.success('Role created');
      }
      setEditorOpen(false);
      fetchRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRole) return;
    setSubmitting(true);
    try {
      await api.roles.delete(editingRole.id);
      toast.success('Role deleted');
      setDeleteOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete role');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage roles and their permissions.</p>
        </div>
        <Button onClick={openCreate}>Create Role</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No roles found.</TableCell>
                </TableRow>
              ) : roles.map((role) => {
                const enabledCount = Object.values(role.permissions).filter(Boolean).length;
                const totalCount = Object.values(PERMISSION_GROUPS).flat().length;
                return (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-muted-foreground">{role.description || '—'}</TableCell>
                    <TableCell>
                      {role.isSystem ? <Badge variant="secondary">System</Badge> : <Badge variant="outline">Custom</Badge>}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{enabledCount}/{totalCount}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                        {role.isSystem ? 'View' : 'Edit'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ─── Role Editor Dialog ─── */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? `Edit Role: ${editingRole.name}` : 'Create Role'}</DialogTitle>
            <DialogDescription>
              {editingRole?.isSystem ? 'System roles cannot be renamed, but you can view their permissions.' : 'Set the name and permissions for this role.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={!!editingRole?.isSystem}
                  placeholder="Role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  disabled={!!editingRole?.isSystem}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Permissions</h3>
              <div className="space-y-4">
                {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
                  const allOn = perms.every(p => formPermissions[p]);
                  const someOn = perms.some(p => formPermissions[p]) && !allOn;
                  return (
                    <Card key={group}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{group}</CardTitle>
                          <Button
                            variant="ghost" size="sm"
                            className="text-xs h-6"
                            disabled={!!editingRole?.isSystem}
                            onClick={() => toggleGroupAll(group)}
                          >
                            {allOn ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {perms.map(perm => (
                            <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                              <Switch
                                checked={!!formPermissions[perm]}
                                onCheckedChange={(checked) => {
                                  setFormPermissions(prev => ({ ...prev, [perm]: checked }));
                                }}
                                disabled={!!editingRole?.isSystem}
                              />
                              {permissionLabel(perm)}
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            {editingRole && !editingRole.isSystem && (
              <Button variant="destructive" onClick={() => { setEditorOpen(false); setDeleteOpen(true); }} className="mr-auto">
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              {editingRole?.isSystem ? 'Close' : 'Cancel'}
            </Button>
            {!editingRole?.isSystem && (
              <Button onClick={handleSave} disabled={submitting || !formName}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Role Dialog ─── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{editingRole?.name}</strong>? Users assigned this role will not be affected, but the role will no longer be available.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
