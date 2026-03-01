// PagePress v0.0.18 - 2026-03-01
// Activity logs viewer

import { useState, useEffect, useCallback } from 'react';
import { api, type ActivityLogEntry } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const ACTION_COLORS: Record<string, string> = {
  login: 'default',
  logout: 'secondary',
  register: 'default',
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
  unlock: 'outline',
};

function actionBadgeVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  for (const [key, variant] of Object.entries(ACTION_COLORS)) {
    if (action.includes(key)) return variant as 'default' | 'secondary' | 'destructive' | 'outline';
  }
  return 'outline';
}

export function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 0 });
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.activityLogs.list({
        page: pagination.page,
        limit: pagination.limit,
        action: actionFilter || undefined,
        entityType: entityFilter || undefined,
      });
      setLogs(res.logs);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter, entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">View recent activity across the site.</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v === 'all' ? '' : v); setPagination(p => ({ ...p, page: 1 })); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All actions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="register">Register</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v === 'all' ? '' : v); setPagination(p => ({ ...p, page: 1 })); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All entities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entities</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="page">Page</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="session">Session</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="invite">Invite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No activity found.</TableCell>
                </TableRow>
              ) : logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{log.username}</TableCell>
                  <TableCell>
                    <Badge variant={actionBadgeVariant(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    {log.entityType && (
                      <span className="text-sm">
                        {log.entityType}
                        {log.entityName && <span className="text-muted-foreground"> — {log.entityName}</span>}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {log.ipAddress && <span className="font-mono text-xs">{log.ipAddress}</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
