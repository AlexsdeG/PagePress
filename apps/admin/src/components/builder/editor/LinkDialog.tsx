// PagePress v0.0.11 - 2025-12-04
// Link Dialog - Form for adding/editing links in TipTap

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link2, Trash2 } from 'lucide-react';

interface LinkDialogProps {
  initialUrl?: string;
  initialTarget?: '_self' | '_blank';
  onSubmit: (url: string, target: '_self' | '_blank') => void;
  onCancel: () => void;
}

/**
 * Dialog for creating and editing links
 */
export function LinkDialog({
  initialUrl = '',
  initialTarget = '_self',
  onSubmit,
  onCancel,
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [target, setTarget] = useState<'_self' | '_blank'>(initialTarget);

  // Update when initial values change
  useEffect(() => {
    setUrl(initialUrl);
    setTarget(initialTarget);
  }, [initialUrl, initialTarget]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Validate and normalize URL
      let normalizedUrl = url.trim();
      if (normalizedUrl && !normalizedUrl.match(/^(https?:\/\/|mailto:|tel:|\/|#)/)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      onSubmit(normalizedUrl, target);
    },
    [url, target, onSubmit]
  );

  const handleRemove = useCallback(() => {
    onSubmit('', '_self');
  }, [onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [onCancel]
  );

  const isEditing = Boolean(initialUrl);

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="p-3 space-y-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 pb-2 border-b">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">
          {isEditing ? 'Edit Link' : 'Add Link'}
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-url" className="text-xs">
          URL
        </Label>
        <Input
          id="link-url"
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoFocus
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-target" className="text-xs">
          Open in
        </Label>
        <Select
          value={target}
          onValueChange={(value) => setTarget(value as '_self' | '_blank')}
        >
          <SelectTrigger id="link-target" className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_self">Same window</SelectItem>
            <SelectItem value="_blank">New window</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between pt-2">
        {isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        ) : (
          <div />
        )}
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default LinkDialog;
