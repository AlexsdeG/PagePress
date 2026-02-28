// PagePress v0.0.15 - 2026-02-28
// Templates management page — manages page-level and section templates

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  api,
  type Page,
  type CreateTemplateData,
  type UpdateTemplateData,
  type TemplateType,
  type SectionTemplate,
  type SectionTemplateCategory,
} from '@/lib/api';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Template form schema
const templateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string()
    .max(255)
    .regex(/^[a-z0-9-]*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  templateType: z.enum(['header', 'footer', 'notfound', 'custom']),
  published: z.boolean(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

// Section template form schema
const sectionTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  category: z.enum([
    'hero', 'features', 'cta', 'contact', 'testimonials',
    'pricing', 'faq', 'footer', 'header', 'content', 'gallery', 'other',
  ]),
});

type SectionTemplateFormData = z.infer<typeof sectionTemplateSchema>;

const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  header: 'Header',
  footer: 'Footer',
  notfound: '404 Page',
  custom: 'Custom',
};

const CATEGORY_LABELS: Record<SectionTemplateCategory, string> = {
  hero: 'Hero',
  features: 'Features',
  cta: 'Call to Action',
  contact: 'Contact',
  testimonials: 'Testimonials',
  pricing: 'Pricing',
  faq: 'FAQ',
  footer: 'Footer',
  header: 'Header',
  content: 'Content',
  gallery: 'Gallery',
  other: 'Other',
};

export function Templates() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('page-templates');

  // ─── Page Templates State ─────────────────────────────────────
  const [templates, setTemplates] = useState<Page[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesPagination, setTemplatesPagination] = useState({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [templateTypeFilter, setTemplateTypeFilter] = useState<string>('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [createTemplateDialogOpen, setCreateTemplateDialogOpen] = useState(false);
  const [editTemplateDialogOpen, setEditTemplateDialogOpen] = useState(false);
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Page | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // System templates overview  
  const [systemTemplates, setSystemTemplates] = useState<Record<string, Page | null>>({
    header: null, footer: null, notfound: null,
  });

  // ─── Section Templates State ──────────────────────────────────
  const [sectionTemplates, setSectionTemplates] = useState<SectionTemplate[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsPagination, setSectionsPagination] = useState({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [sectionCategoryFilter, setSectionCategoryFilter] = useState<string>('all');
  const [sectionSearch, setSectionSearch] = useState('');
  const [deleteSectionDialogOpen, setDeleteSectionDialogOpen] = useState(false);
  const [editSectionDialogOpen, setEditSectionDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SectionTemplate | null>(null);

  // ─── Forms ─────────────────────────────────────────────────────
  const createTemplateForm = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: { title: '', slug: '', templateType: 'custom', published: false },
  });

  const editTemplateForm = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: { title: '', slug: '', templateType: 'custom', published: false },
  });

  const editSectionForm = useForm<SectionTemplateFormData>({
    resolver: zodResolver(sectionTemplateSchema),
    defaultValues: { name: '', description: '', category: 'other' },
  });

  // ─── Load Page Templates ─────────────────────────────────────
  const loadTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const params: Record<string, unknown> = {
        page: templatesPagination.page,
        limit: templatesPagination.limit,
      };
      if (templateTypeFilter !== 'all') params.templateType = templateTypeFilter;
      if (templateSearch) params.search = templateSearch;

      const [response, systemResponse] = await Promise.all([
        api.templates.list(params as Parameters<typeof api.templates.list>[0]),
        api.templates.getSystem(),
      ]);

      setTemplates(response.templates);
      setTemplatesPagination(response.pagination);
      setSystemTemplates(systemResponse.systemTemplates);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setTemplatesLoading(false);
    }
  }, [templatesPagination.page, templatesPagination.limit, templateTypeFilter, templateSearch]);

  useEffect(() => {
    if (activeTab === 'page-templates') loadTemplates();
  }, [activeTab, loadTemplates]);

  // ─── Load Section Templates ───────────────────────────────────
  const loadSectionTemplates = useCallback(async () => {
    try {
      setSectionsLoading(true);
      const params: Record<string, unknown> = {
        page: sectionsPagination.page,
        limit: sectionsPagination.limit,
      };
      if (sectionCategoryFilter !== 'all') params.category = sectionCategoryFilter;
      if (sectionSearch) params.search = sectionSearch;

      const response = await api.sectionTemplates.list(
        params as Parameters<typeof api.sectionTemplates.list>[0]
      );
      setSectionTemplates(response.sectionTemplates);
      setSectionsPagination(response.pagination);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load section templates');
    } finally {
      setSectionsLoading(false);
    }
  }, [sectionsPagination.page, sectionsPagination.limit, sectionCategoryFilter, sectionSearch]);

  useEffect(() => {
    if (activeTab === 'section-templates') loadSectionTemplates();
  }, [activeTab, loadSectionTemplates]);

  // ─── Page Template CRUD ─────────────────────────────────────
  const handleCreateTemplate = async (data: TemplateFormData) => {
    try {
      setSubmitting(true);
      const createData: CreateTemplateData = {
        title: data.title,
        templateType: data.templateType,
        published: data.published,
      };
      if (data.slug) createData.slug = data.slug;
      await api.templates.create(createData);
      setCreateTemplateDialogOpen(false);
      createTemplateForm.reset();
      toast.success('Template created');
      loadTemplates();
    } catch (err) {
      createTemplateForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create template',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTemplate = async (data: TemplateFormData) => {
    if (!selectedTemplate) return;
    try {
      setSubmitting(true);
      const updateData: UpdateTemplateData = {
        title: data.title,
        slug: data.slug || undefined,
        templateType: data.templateType,
        published: data.published,
      };
      await api.templates.update(selectedTemplate.id, updateData);
      setEditTemplateDialogOpen(false);
      setSelectedTemplate(null);
      toast.success('Template updated');
      loadTemplates();
    } catch (err) {
      editTemplateForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update template',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      setSubmitting(true);
      await api.templates.delete(selectedTemplate.id);
      setDeleteTemplateDialogOpen(false);
      setSelectedTemplate(null);
      toast.success('Template deleted');
      loadTemplates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateTemplate = async (template: Page) => {
    try {
      await api.templates.duplicate(template.id);
      toast.success('Template duplicated');
      loadTemplates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate template');
    }
  };

  // ─── Section Template CRUD ─────────────────────────────────
  const handleEditSection = async (data: SectionTemplateFormData) => {
    if (!selectedSection) return;
    try {
      setSubmitting(true);
      await api.sectionTemplates.update(selectedSection.id, {
        name: data.name,
        description: data.description || null,
        category: data.category,
      });
      setEditSectionDialogOpen(false);
      setSelectedSection(null);
      toast.success('Section template updated');
      loadSectionTemplates();
    } catch (err) {
      editSectionForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!selectedSection) return;
    try {
      setSubmitting(true);
      await api.sectionTemplates.delete(selectedSection.id);
      setDeleteSectionDialogOpen(false);
      setSelectedSection(null);
      toast.success('Section template deleted');
      loadSectionTemplates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete section template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportSections = async () => {
    try {
      const params: { category?: string } = {};
      if (sectionCategoryFilter !== 'all') params.category = sectionCategoryFilter;
      const response = await api.sectionTemplates.export(params);
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `section-templates-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${response.count} templates`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export');
    }
  };

  const handleImportSections = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text) as { templates: Array<{ name: string; description?: string; category?: string; contentJson: Record<string, unknown> }> };
        if (!data.templates || !Array.isArray(data.templates)) {
          throw new Error('Invalid template file format');
        }
        const response = await api.sectionTemplates.import(data.templates);
        toast.success(`Imported ${response.count} templates`);
        loadSectionTemplates();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to import');
      }
    };
    input.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">
          Manage page templates (header, footer, 404) and reusable section templates
        </p>
      </div>

      {/* System Templates Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['header', 'footer', 'notfound'] as const).map((type) => {
          const tmpl = systemTemplates[type];
          return (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardDescription>{TEMPLATE_TYPE_LABELS[type]} Template</CardDescription>
                <CardTitle className="text-lg">
                  {tmpl ? tmpl.title : 'Not Set'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tmpl ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/pages/${tmpl.id}/edit`)}
                    >
                      Edit in Builder
                    </Button>
                    <Badge variant={tmpl.published ? 'default' : 'secondary'}>
                      {tmpl.published ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      createTemplateForm.reset({
                        title: `${TEMPLATE_TYPE_LABELS[type]} Template`,
                        slug: '',
                        templateType: type,
                        published: false,
                      });
                      setCreateTemplateDialogOpen(true);
                    }}
                  >
                    Create {TEMPLATE_TYPE_LABELS[type]}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="page-templates">Page Templates</TabsTrigger>
          <TabsTrigger value="section-templates">Section Templates</TabsTrigger>
        </TabsList>

        {/* Page Templates Tab */}
        <TabsContent value="page-templates" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search templates..."
                    value={templateSearch}
                    onChange={(e) => {
                      setTemplateSearch(e.target.value);
                      setTemplatesPagination((p) => ({ ...p, page: 1 }));
                    }}
                  />
                </div>
                <Select
                  value={templateTypeFilter}
                  onValueChange={(v) => {
                    setTemplateTypeFilter(v);
                    setTemplatesPagination((p) => ({ ...p, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Template Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="notfound">404 Page</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => {
                  createTemplateForm.reset({ title: '', slug: '', templateType: 'custom', published: false });
                  setCreateTemplateDialogOpen(true);
                }}>
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Templates Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Templates</CardTitle>
              <CardDescription>
                {templatesPagination.total} template{templatesPagination.total !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No templates found. Create a template to get started.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((tmpl) => (
                        <TableRow key={tmpl.id}>
                          <TableCell className="font-medium">{tmpl.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {TEMPLATE_TYPE_LABELS[tmpl.templateType || 'custom']}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={tmpl.published ? 'default' : 'secondary'}>
                              {tmpl.published ? 'Active' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(tmpl.updatedAt)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">•••</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/pages/${tmpl.id}/edit`)}>
                                  Edit in Builder
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedTemplate(tmpl);
                                  editTemplateForm.reset({
                                    title: tmpl.title,
                                    slug: tmpl.slug,
                                    templateType: (tmpl.templateType || 'custom') as TemplateType,
                                    published: tmpl.published,
                                  });
                                  setEditTemplateDialogOpen(true);
                                }}>
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateTemplate(tmpl)}>
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedTemplate(tmpl);
                                    setDeleteTemplateDialogOpen(true);
                                  }}
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

                  {templatesPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {templatesPagination.page} of {templatesPagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline" size="sm"
                          disabled={templatesPagination.page <= 1}
                          onClick={() => setTemplatesPagination((p) => ({ ...p, page: p.page - 1 }))}
                        >Previous</Button>
                        <Button
                          variant="outline" size="sm"
                          disabled={templatesPagination.page >= templatesPagination.totalPages}
                          onClick={() => setTemplatesPagination((p) => ({ ...p, page: p.page + 1 }))}
                        >Next</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Templates Tab */}
        <TabsContent value="section-templates" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search section templates..."
                    value={sectionSearch}
                    onChange={(e) => {
                      setSectionSearch(e.target.value);
                      setSectionsPagination((p) => ({ ...p, page: 1 }));
                    }}
                  />
                </div>
                <Select
                  value={sectionCategoryFilter}
                  onValueChange={(v) => {
                    setSectionCategoryFilter(v);
                    setSectionsPagination((p) => ({ ...p, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleImportSections}>
                  Import
                </Button>
                <Button variant="outline" onClick={handleExportSections}>
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section Templates Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Section Template Library</CardTitle>
              <CardDescription>
                {sectionsPagination.total} section template{sectionsPagination.total !== 1 ? 's' : ''}.
                Save elements from the builder using right-click → "Save as Template".
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sectionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : sectionTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No section templates yet. Save elements from the builder to build your library.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionTemplates.map((section) => (
                      <Card key={section.id} className="group relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-sm font-medium">{section.name}</CardTitle>
                              {section.description && (
                                <CardDescription className="text-xs mt-1 line-clamp-2">
                                  {section.description}
                                </CardDescription>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">•••</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedSection(section);
                                  editSectionForm.reset({
                                    name: section.name,
                                    description: section.description || '',
                                    category: section.category,
                                  });
                                  setEditSectionDialogOpen(true);
                                }}>
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedSection(section);
                                    setDeleteSectionDialogOpen(true);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[section.category] || section.category}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(section.updatedAt)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {sectionsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {sectionsPagination.page} of {sectionsPagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline" size="sm"
                          disabled={sectionsPagination.page <= 1}
                          onClick={() => setSectionsPagination((p) => ({ ...p, page: p.page - 1 }))}
                        >Previous</Button>
                        <Button
                          variant="outline" size="sm"
                          disabled={sectionsPagination.page >= sectionsPagination.totalPages}
                          onClick={() => setSectionsPagination((p) => ({ ...p, page: p.page + 1 }))}
                        >Next</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={createTemplateDialogOpen} onOpenChange={setCreateTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>
              Create a new page template. Edit its content in the visual builder.
            </DialogDescription>
          </DialogHeader>
          <Form {...createTemplateForm}>
            <form onSubmit={createTemplateForm.handleSubmit(handleCreateTemplate)} className="space-y-4">
              <FormField
                control={createTemplateForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="My Template" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createTemplateForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (optional)</FormLabel>
                    <FormControl><Input placeholder="my-template" {...field} /></FormControl>
                    <FormDescription>Leave empty to auto-generate</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createTemplateForm.control}
                name="templateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                        <SelectItem value="notfound">404 Page</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Header/Footer templates are auto-injected. Only one of each type allowed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createTemplateForm.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" />
                    </FormControl>
                    <FormLabel className="mt-0!">Activate immediately</FormLabel>
                  </FormItem>
                )}
              />
              {createTemplateForm.formState.errors.root && (
                <p className="text-sm text-destructive">{createTemplateForm.formState.errors.root.message}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateTemplateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Template'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editTemplateDialogOpen} onOpenChange={setEditTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update template details.</DialogDescription>
          </DialogHeader>
          <Form {...editTemplateForm}>
            <form onSubmit={editTemplateForm.handleSubmit(handleEditTemplate)} className="space-y-4">
              <FormField
                control={editTemplateForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editTemplateForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editTemplateForm.control}
                name="templateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                        <SelectItem value="notfound">404 Page</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editTemplateForm.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" />
                    </FormControl>
                    <FormLabel className="mt-0!">Active</FormLabel>
                  </FormItem>
                )}
              />
              {editTemplateForm.formState.errors.root && (
                <p className="text-sm text-destructive">{editTemplateForm.formState.errors.root.message}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTemplateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Template Dialog */}
      <Dialog open={deleteTemplateDialogOpen} onOpenChange={setDeleteTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedTemplate?.title}&rdquo;?
              Pages referencing this template will lose their assignment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTemplateDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTemplate} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Template Dialog */}
      <Dialog open={editSectionDialogOpen} onOpenChange={setEditSectionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Section Template</DialogTitle>
            <DialogDescription>Update section template details.</DialogDescription>
          </DialogHeader>
          <Form {...editSectionForm}>
            <form onSubmit={editSectionForm.handleSubmit(handleEditSection)} className="space-y-4">
              <FormField
                control={editSectionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editSectionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editSectionForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editSectionForm.formState.errors.root && (
                <p className="text-sm text-destructive">{editSectionForm.formState.errors.root.message}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditSectionDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Section Template Dialog */}
      <Dialog open={deleteSectionDialogOpen} onOpenChange={setDeleteSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedSection?.name}&rdquo;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSectionDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSection} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
