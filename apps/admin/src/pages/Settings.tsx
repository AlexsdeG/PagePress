// PagePress v0.0.19 - 2026-03-01
// Site settings management page with super admin reset controls

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, type SiteSettings } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Settings form schema
const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(100),
  siteDescription: z.string().max(500).optional(),
  siteUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
    fontFamily: z.string(),
  }),
  seo: z.object({
    titleSeparator: z.string().max(10),
    defaultMetaDescription: z.string().max(160),
  }),
  social: z.object({
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  analytics: z.object({
    googleAnalyticsId: z.string().optional(),
  }),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function Settings() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Reset dialog states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetType, setResetType] = useState<'pages' | 'media' | 'database' | 'full' | null>(null);
  const [resetting, setResetting] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: '',
      siteDescription: '',
      siteUrl: '',
      logoUrl: '',
      faviconUrl: '',
      theme: {
        primaryColor: '#3b82f6',
        fontFamily: 'Inter, sans-serif',
      },
      seo: {
        titleSeparator: '|',
        defaultMetaDescription: '',
      },
      social: {
        twitter: '',
        facebook: '',
        instagram: '',
        linkedin: '',
      },
      analytics: {
        googleAnalyticsId: '',
      },
    },
  });

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.settings.get();
        form.reset(response.settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [form]);

  const handleSave = async (data: SettingsFormData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await api.settings.update(data as SiteSettings);
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!resetType) return;

    try {
      setResetting(true);
      setError(null);

      let message = '';
      switch (resetType) {
        case 'pages':
          await api.settings.reset.pages();
          message = 'All pages have been deleted';
          break;
        case 'media':
          await api.settings.reset.media();
          message = 'All media have been deleted';
          break;
        case 'database':
          await api.settings.reset.database();
          message = 'Database has been reset';
          break;
        case 'full':
          await api.settings.reset.full();
          message = 'PagePress has been fully reset to fresh state';
          break;
      }

      toast.success(message);
      setResetDialogOpen(false);
      setResetType(null);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Reset failed';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your website settings and preferences
        </p>
      </div>

      {/* Error/Success messages */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <p className="text-green-700 dark:text-green-400">{success}</p>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              {isSuperAdmin && <TabsTrigger value="system">System</TabsTrigger>}
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Basic information about your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome Website" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your website, shown in the browser title bar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief description of your website..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A short description used in search results and social shares
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="siteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          The full URL of your website (used for canonical URLs)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how your website looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="/uploads/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to your site logo (upload in Media Library first)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="faviconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon URL</FormLabel>
                        <FormControl>
                          <Input placeholder="/uploads/favicon.ico" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to your site favicon (32x32 pixels recommended)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="theme.primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-10 h-10 rounded border cursor-pointer"
                            />
                          </div>
                          <FormDescription>
                            Main brand color in hex format
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="theme.fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Family</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            CSS font-family value
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Settings */}
            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>
                    Search engine optimization configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="seo.titleSeparator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title Separator</FormLabel>
                        <FormControl>
                          <Input placeholder="|" {...field} className="w-20" />
                        </FormControl>
                        <FormDescription>
                          Separator between page title and site name (e.g., "Page Title | Site Name")
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seo.defaultMetaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A compelling description of your website..."
                            {...field}
                            maxLength={160}
                          />
                        </FormControl>
                        <FormDescription>
                          Default description for pages without a custom one (max 160 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Settings */}
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                  <CardDescription>
                    Connect your social media profiles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="social.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter / X</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/yourusername" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/yourpage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/yourusername" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/yourusername" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Settings */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    Configure website analytics and tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="analytics.googleAnalyticsId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Analytics ID</FormLabel>
                        <FormControl>
                          <Input placeholder="G-XXXXXXXXXX" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Google Analytics 4 measurement ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings (Super Admin Only) */}
            {isSuperAdmin && (
              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>System & Danger Zone</CardTitle>
                    <CardDescription>
                      Advanced system operations (Super Admin Only)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Reset Operations</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        These operations are permanent and cannot be undone. Choose carefully:
                      </p>

                      <div className="space-y-3">
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setResetType('pages');
                            setResetDialogOpen(true);
                          }}
                          className="w-full justify-start"
                        >
                          Delete All Pages
                        </Button>
                        <p className="text-xs text-muted-foreground ml-4">
                          Permanently deletes all pages but keeps media, users, and settings
                        </p>

                        <Button
                          variant="destructive"
                          onClick={() => {
                            setResetType('media');
                            setResetDialogOpen(true);
                          }}
                          className="w-full justify-start"
                        >
                          Delete All Media
                        </Button>
                        <p className="text-xs text-muted-foreground ml-4">
                          Permanently deletes all uploaded media files but keeps pages
                        </p>

                        <Button
                          variant="destructive"
                          onClick={() => {
                            setResetType('database');
                            setResetDialogOpen(true);
                          }}
                          className="w-full justify-start"
                        >
                          Reset Database
                        </Button>
                        <p className="text-xs text-muted-foreground ml-4">
                          Deletes all pages, media, and templates but keeps users and roles
                        </p>

                        <Button
                          variant="destructive"
                          onClick={() => {
                            setResetType('full');
                            setResetDialogOpen(true);
                          }}
                          className="w-full justify-start"
                        >
                          Factory Reset
                        </Button>
                        <p className="text-xs text-muted-foreground ml-4">
                          Resets PagePress to fresh state (current session preserved)
                        </p>
                      </div>

                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-4 p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
                        💡 For a complete wipe including all users, run: <code className="font-mono">./reset-pagepress.sh</code>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={saving} size="lg">
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reset</AlertDialogTitle>
            <AlertDialogDescription>
              {resetType === 'pages' && 'This will permanently delete all pages. This action cannot be undone.'}
              {resetType === 'media' && 'This will permanently delete all media files. This action cannot be undone.'}
              {resetType === 'database' && 'This will permanently delete all pages, media, templates, and settings. Users and roles will be preserved. This action cannot be undone.'}
              {resetType === 'full' && 'This will reset PagePress to fresh state, deleting all content but preserving your current super admin session. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={resetting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {resetting ? 'Resetting...' : 'Yes, reset now'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
