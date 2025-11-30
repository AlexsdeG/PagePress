// PagePress v0.0.5 - 2025-11-30
// Media library page with upload and management

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, type Media } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// File size formatter
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file type category
function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'file';
}

// Media card component
function MediaCard({
  media,
  onSelect,
  onDelete,
  selected,
}: {
  media: Media;
  onSelect: (media: Media) => void;
  onDelete: (media: Media) => void;
  selected: boolean;
}) {
  const category = getFileCategory(media.mimeType);
  // Use /api prefix which is proxied to the API server by Vite
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const imageUrl = `${apiUrl}${media.url}`;

  return (
    <div
      className={`group relative cursor-pointer rounded-lg border-2 transition-all ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/20'
      }`}
      onClick={() => onSelect(media)}
    >
      {/* Preview */}
      <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
        {category === 'image' ? (
          <img
            src={imageUrl}
            alt={media.altText || media.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">
              {category === 'video' && '🎬'}
              {category === 'audio' && '🎵'}
              {category === 'pdf' && '📄'}
              {category === 'file' && '📎'}
            </span>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-2">
        <p className="text-sm font-medium truncate" title={media.originalName}>
          {media.originalName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(media.size)}
        </p>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(imageUrl);
          }}
        >
          Copy URL
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(media);
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Selection and dialogs
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load media
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, unknown> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (typeFilter !== 'all') params.type = typeFilter;
      
      const response = await api.media.list(params as Parameters<typeof api.media.list>[0]);
      setMedia(response.media);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(`Uploading ${file.name}...`);
      setError(null);
      
      await api.media.upload(file);
      
      setUploadProgress(null);
      loadMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setUploadProgress(null); // Fixed: Clear progress on error
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMedia) return;
    
    try {
      await api.media.delete(selectedMedia.id);
      setDeleteDialogOpen(false);
      setSelectedMedia(null);
      loadMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media');
    }
  };

  // Handle media select
  const handleSelect = (m: Media) => {
    setSelectedMedia(m);
    setDetailsDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (m: Media) => {
    setSelectedMedia(m);
    setDeleteDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Use /api prefix which is proxied to the API server by Vite
  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Upload and manage your images, documents, and other files
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p>{uploadProgress}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
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

      {/* Media grid */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>
            {pagination.total} file{pagination.total !== 1 ? 's' : ''} in library
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No files uploaded yet.</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Upload Your First File
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {media.map((m) => (
                  <MediaCard
                    key={m.id}
                    media={m}
                    onSelect={handleSelect}
                    onDelete={openDeleteDialog}
                    selected={selectedMedia?.id === m.id}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {getFileCategory(selectedMedia.mimeType) === 'image' ? (
                  <img
                    src={`${apiUrl}${selectedMedia.url}`}
                    alt={selectedMedia.altText || selectedMedia.originalName}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-6xl">
                    {getFileCategory(selectedMedia.mimeType) === 'video' && '🎬'}
                    {getFileCategory(selectedMedia.mimeType) === 'audio' && '🎵'}
                    {getFileCategory(selectedMedia.mimeType) === 'pdf' && '📄'}
                    {getFileCategory(selectedMedia.mimeType) === 'file' && '📎'}
                  </span>
                )}
              </div>
              
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Filename</p>
                  <p className="font-medium">{selectedMedia.originalName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{formatFileSize(selectedMedia.size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="outline">{selectedMedia.mimeType}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{formatDate(selectedMedia.createdAt)}</p>
                </div>
              </div>
              
              {/* URL */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">URL</p>
                <div className="flex gap-2">
                  <Input
                    value={`${apiUrl}${selectedMedia.url}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(`${apiUrl}${selectedMedia.url}`)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDetailsDialogOpen(false);
                setDeleteDialogOpen(true);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedMedia?.originalName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
