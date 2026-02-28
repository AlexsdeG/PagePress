// PagePress v0.0.6 - 2025-12-03
// Pages management page with CRUD operations

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, type Page, type CreatePageData, type UpdatePageData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Page form schema
const pageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  slug: z.string()
    .max(255, 'Slug is too long')
    .regex(/^[a-z0-9-]*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  type: z.enum(['page', 'post', 'template']),
  published: z.boolean(),
  isHomepage: z.boolean(),
  contentJson: z.string().optional(),
});

// Rename form schema (simpler)
const renameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
});

type PageFormData = z.infer<typeof pageSchema>;
type RenameFormData = z.infer<typeof renameSchema>;

export function Pages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form setup
  const createForm = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      type: 'page',
      published: false,
      isHomepage: false,
      contentJson: '',
    },
  });

  const editForm = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      type: 'page',
      published: false,
      isHomepage: false,
      contentJson: '',
    },
  });

  const renameForm = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      title: '',
    },
  });

  // Load pages
  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, unknown> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (typeFilter !== 'all') params.type = typeFilter;
      if (publishedFilter !== 'all') params.published = publishedFilter === 'published';
      if (searchQuery) params.search = searchQuery;
      
      const response = await api.pages.list(params as Parameters<typeof api.pages.list>[0]);
      setPages(response.pages);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter, publishedFilter, searchQuery]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Create page
  const handleCreate = async (data: PageFormData) => {
    try {
      setSubmitting(true);
      
      // Parse contentJson string to object if provided and not empty
      let parsedContentJson: Record<string, unknown> | undefined;
      if (data.contentJson && data.contentJson.trim() !== '' && data.contentJson !== '{}') {
        try {
          parsedContentJson = JSON.parse(data.contentJson);
        } catch {
          parsedContentJson = undefined;
        }
      }
      
      const createData: CreatePageData = {
        title: data.title,
        type: data.type,
        published: data.published,
        isHomepage: data.isHomepage,
      };
      if (data.slug) createData.slug = data.slug;
      if (parsedContentJson) createData.contentJson = parsedContentJson;
      
      await api.pages.create(createData);
      setCreateDialogOpen(false);
      createForm.reset();
      loadPages();
    } catch (err) {
      createForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create page',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Edit page
  const handleEdit = async (data: PageFormData) => {
    if (!selectedPage) return;
    
    try {
      setSubmitting(true);
      
      // Parse contentJson string to object if provided
      let parsedContentJson: Record<string, unknown> | undefined;
      if (data.contentJson) {
        try {
          parsedContentJson = JSON.parse(data.contentJson);
        } catch {
          parsedContentJson = undefined;
        }
      }
      
      const updateData: UpdatePageData = {
        title: data.title,
        slug: data.slug || undefined,
        type: data.type,
        published: data.published,
        isHomepage: data.isHomepage,
        contentJson: parsedContentJson,
      };
      
      await api.pages.update(selectedPage.id, updateData);
      setEditDialogOpen(false);
      setSelectedPage(null);
      editForm.reset();
      loadPages();
    } catch (err) {
      editForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update page',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete page
  const handleDelete = async () => {
    if (!selectedPage) return;
    
    try {
      setSubmitting(true);
      await api.pages.delete(selectedPage.id);
      setDeleteDialogOpen(false);
      setSelectedPage(null);
      loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page');
    } finally {
      setSubmitting(false);
    }
  };

  // Duplicate page
  const handleDuplicate = async (page: Page) => {
    try {
      await api.pages.duplicate(page.id);
      loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate page');
    }
  };

  // Toggle published status
  const handleTogglePublished = async (page: Page) => {
    try {
      await api.pages.update(page.id, { published: !page.published });
      loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update page');
    }
  };

  // Rename page
  const handleRename = async (data: RenameFormData) => {
    if (!selectedPage) return;
    
    try {
      setSubmitting(true);
      await api.pages.update(selectedPage.id, { title: data.title });
      setRenameDialogOpen(false);
      setSelectedPage(null);
      renameForm.reset();
      toast.success('Page renamed');
      loadPages();
    } catch (err) {
      renameForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to rename page',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open rename dialog
  const openRenameDialog = (page: Page) => {
    setSelectedPage(page);
    renameForm.reset({ title: page.title });
    setRenameDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (page: Page) => {
    setSelectedPage(page);
    editForm.reset({
      title: page.title,
      slug: page.slug,
      type: page.type,
      published: page.published,
      isHomepage: page.isHomepage ?? false,
      contentJson: page.contentJson ? JSON.stringify(page.contentJson, null, 2) : '{}',
    });
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (page: Page) => {
    setSelectedPage(page);
    setDeleteDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">
            Manage your website pages, posts, and templates
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          Create Page
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="page">Pages</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={publishedFilter}
              onValueChange={(value) => {
                setPublishedFilter(value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Pages table */}
      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>
            {pagination.total} page{pagination.total !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pages found. Create your first page to get started.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          {page.title}
                          {page.isHomepage && (
                            <Badge variant="outline" className="text-xs">Home</Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {page.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.published ? 'default' : 'secondary'}>
                          {page.published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(page.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              •••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/pages/${page.id}/edit`)}>
                              Edit in Builder
                            </DropdownMenuItem>
                            {page.published && (
                              <DropdownMenuItem onClick={() => window.open(page.isHomepage ? '/' : `/${page.slug}`, '_blank')}>
                                Show in Frontend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openRenameDialog(page)}>
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(page)}>
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(page)}>
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePublished(page)}>
                              {page.published ? 'Unpublish' : 'Publish'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openDeleteDialog(page)}
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Create a new page for your website. The slug will be auto-generated from the title if left empty.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Page" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="my-awesome-page" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty to auto-generate from title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="page">Page</SelectItem>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Publish immediately</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="isHomepage"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Set as Homepage</FormLabel>
                    <FormDescription className="!mt-0 ml-2">
                      Only one page can be the homepage
                    </FormDescription>
                  </FormItem>
                )}
              />
              {createForm.formState.errors.root && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.root.message}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Page'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>
              Update page details. Content editing will be available in the page builder.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="page">Page</SelectItem>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Published</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isHomepage"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Set as Homepage</FormLabel>
                    <FormDescription className="!mt-0 ml-2">
                      Only one page can be the homepage
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="contentJson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content JSON</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="font-mono text-sm"
                        rows={6}
                      />
                    </FormControl>
                    <FormDescription>
                      Raw JSON content (advanced editing)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editForm.formState.errors.root && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.root.message}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPage?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename Page</DialogTitle>
            <DialogDescription>
              Enter a new title for the page.
            </DialogDescription>
          </DialogHeader>
          <Form {...renameForm}>
            <form onSubmit={renameForm.handleSubmit(handleRename)} className="space-y-4">
              <FormField
                control={renameForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {renameForm.formState.errors.root && (
                <p className="text-sm text-destructive">
                  {renameForm.formState.errors.root.message}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRenameDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Renaming...' : 'Rename'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
