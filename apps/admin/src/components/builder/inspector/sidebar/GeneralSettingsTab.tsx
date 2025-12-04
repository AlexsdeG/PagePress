// PagePress v0.0.9 - 2025-12-04
// General Settings Tab - Element name, ID, classes, and pseudo-state management

import { useState, useCallback } from 'react';
import { useNode } from '@craftjs/core';
import { 
  Copy, 
  Plus, 
  X, 
  Check, 
  ChevronDown,
  Palette,
  Info,
  Download,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useClassStore, sanitizeClassName } from './classStore';
import { 
  COMPONENT_TYPE_LABELS, 
  getComponentBadgeColor,
  generateElementId,
  PSEUDO_CLASS_OPTIONS,
  type ElementMetadata,
  type PseudoClass,
} from './types';
import type { AdvancedStyling } from '../styles/types';

interface GeneralSettingsTabProps {
  /** Current element styling for creating classes */
  styling: Partial<AdvancedStyling>;
  /** Current pseudo-state being edited */
  activePseudoState: PseudoClass;
  /** Callback when pseudo-state changes */
  onPseudoStateChange: (state: PseudoClass) => void;
  /** Additional class name */
  className?: string;
}

/**
 * General Settings Tab - Element metadata, pseudo-state, and class management
 */
export function GeneralSettingsTab({ 
  styling, 
  activePseudoState,
  onPseudoStateChange,
  className,
}: GeneralSettingsTabProps) {
  const {
    actions: { setProp },
    displayName,
    componentType,
    customName,
    elementId,
    appliedClasses,
  } = useNode((node) => ({
    nodeId: node.id,
    displayName: node.data.displayName || node.data.name || 'Element',
    componentType: node.data.name || 'Unknown',
    customName: (node.data.props.elementMetadata as ElementMetadata | undefined)?.customName,
    elementId: (node.data.props.elementMetadata as ElementMetadata | undefined)?.elementId || node.id,
    appliedClasses: (node.data.props.elementMetadata as ElementMetadata | undefined)?.appliedClasses || [],
  }));

  const { classes, addClass, isNameAvailable, searchClasses } = useClassStore();
  
  const [localName, setLocalName] = useState(customName || '');
  const [classSearch, setClassSearch] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassDialogOpen, setNewClassDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportClassName, setExportClassName] = useState('');
  const [classListOpen, setClassListOpen] = useState(true);

  // Filter classes for dropdown
  const filteredClasses = classSearch 
    ? searchClasses(classSearch)
    : classes;

  // Update custom name
  const handleNameChange = useCallback((value: string) => {
    setLocalName(value);
    setProp((props: Record<string, unknown>) => {
      const metadata = (props.elementMetadata || { elementId: elementId, appliedClasses: [] }) as ElementMetadata;
      props.elementMetadata = { ...metadata, customName: value || undefined };
    });
  }, [setProp, elementId]);

  // Ensure element has an ID
  const ensureElementId = useCallback(() => {
    setProp((props: Record<string, unknown>) => {
      const metadata = (props.elementMetadata || {}) as ElementMetadata;
      if (!metadata.elementId) {
        props.elementMetadata = { 
          ...metadata, 
          elementId: generateElementId(),
          appliedClasses: metadata.appliedClasses || [],
        };
      }
    });
  }, [setProp]);

  // Copy element ID to clipboard
  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(elementId);
    toast.success('Element ID copied');
  }, [elementId]);

  // Add a class to the element
  const handleAddClass = useCallback((className: string) => {
    if (appliedClasses.includes(className)) {
      toast.error('Class already applied');
      return;
    }
    
    setProp((props: Record<string, unknown>) => {
      const metadata = (props.elementMetadata || { elementId: elementId, appliedClasses: [] }) as ElementMetadata;
      props.elementMetadata = {
        ...metadata,
        appliedClasses: [...metadata.appliedClasses, className],
      };
    });
    setClassSearch('');
    toast.success(`Class "${className}" added`);
  }, [setProp, elementId, appliedClasses]);

  // Remove a class from the element
  const handleRemoveClass = useCallback((className: string) => {
    setProp((props: Record<string, unknown>) => {
      const metadata = (props.elementMetadata || { elementId: elementId, appliedClasses: [] }) as ElementMetadata;
      props.elementMetadata = {
        ...metadata,
        appliedClasses: metadata.appliedClasses.filter(c => c !== className),
      };
    });
    toast.success(`Class "${className}" removed`);
  }, [setProp, elementId]);

  // Create a new class from current styling
  const handleCreateClass = useCallback(() => {
    if (!newClassName.trim()) {
      toast.error('Please enter a class name');
      return;
    }

    const sanitized = sanitizeClassName(newClassName);
    if (!isNameAvailable(sanitized)) {
      toast.error(`Class "${sanitized}" already exists`);
      return;
    }

    // Create the class
    addClass({
      name: sanitized,
      label: newClassName,
      styling: styling,
      category: 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Apply it to the element
    handleAddClass(sanitized);
    
    setNewClassName('');
    setNewClassDialogOpen(false);
    toast.success(`Class "${sanitized}" created and applied`);
  }, [newClassName, isNameAvailable, addClass, styling, handleAddClass]);

  // Export current styling as a new class (without applying)
  const handleExportClass = useCallback(() => {
    if (!exportClassName.trim()) {
      toast.error('Please enter a class name');
      return;
    }

    const sanitized = sanitizeClassName(exportClassName);
    if (!isNameAvailable(sanitized)) {
      toast.error(`Class "${sanitized}" already exists`);
      return;
    }

    // Create the class without applying
    addClass({
      name: sanitized,
      label: exportClassName,
      styling: styling,
      category: 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    setExportClassName('');
    setExportDialogOpen(false);
    toast.success(`Class "${sanitized}" exported successfully`);
  }, [exportClassName, isNameAvailable, addClass, styling]);

  // Ensure element has ID on mount
  ensureElementId();

  const typeLabel = COMPONENT_TYPE_LABELS[componentType] || componentType;
  const badgeColor = getComponentBadgeColor(componentType);

  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        {/* Element Type Badge & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs px-2 py-0.5 border', badgeColor)}>
              {typeLabel}
            </Badge>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                This element is a {typeLabel} component
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Export Styling as Class */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Download className="h-3 w-3" />
                Export Style
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Styling as Class</DialogTitle>
                <DialogDescription>
                  Save the current element's styling as a reusable CSS class.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input
                    value={exportClassName}
                    onChange={(e) => setExportClassName(e.target.value)}
                    placeholder="e.g., primary-button, hero-section"
                  />
                  {exportClassName && (
                    <p className="text-xs text-muted-foreground">
                      Will be saved as: <code className="bg-muted px-1 rounded">{sanitizeClassName(exportClassName)}</code>
                    </p>
                  )}
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground">
                    <Download className="h-3.5 w-3.5 inline mr-1" />
                    This will export all styling to a reusable class without applying it to this element.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExportClass}>
                  <Download className="h-4 w-4 mr-1" />
                  Export Class
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pseudo-State Selector */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            Styling State
          </Label>
          <Select value={activePseudoState} onValueChange={(value) => onPseudoStateChange(value as PseudoClass)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select state..." />
            </SelectTrigger>
            <SelectContent>
              {PSEUDO_CLASS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className={cn(
                    'font-mono',
                    option.value !== 'default' && 'text-purple-600 dark:text-purple-400'
                  )}>
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {activePseudoState === 'default' 
              ? 'Editing default styles'
              : `Editing styles for ${PSEUDO_CLASS_OPTIONS.find(o => o.value === activePseudoState)?.label || activePseudoState} state`
            }
          </p>
        </div>

        <Separator />

        {/* Custom Name */}
      <div className="space-y-2">
        <Label className="text-xs">Element Name</Label>
        <Input
          value={localName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder={displayName}
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Give this element a custom name for easier identification
        </p>
      </div>

      {/* Element ID (readonly) */}
      <div className="space-y-2">
        <Label className="text-xs">Element ID</Label>
        <div className="flex gap-1">
          <Input
            value={elementId}
            readOnly
            className="h-8 text-sm font-mono bg-muted text-muted-foreground"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCopyId}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Unique identifier for this element (read-only)
        </p>
      </div>

      <Separator />

      {/* CSS Classes Section */}
      <Collapsible open={classListOpen} onOpenChange={setClassListOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium hover:text-foreground">
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              !classListOpen && '-rotate-90'
            )} />
            CSS Classes
          </CollapsibleTrigger>
          <Dialog open={newClassDialogOpen} onOpenChange={setNewClassDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Create Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New CSS Class</DialogTitle>
                <DialogDescription>
                  Create a new CSS class from the current element's styling settings.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g., primary-button, hero-section"
                  />
                  {newClassName && (
                    <p className="text-xs text-muted-foreground">
                      Will be saved as: <code className="bg-muted px-1 rounded">{sanitizeClassName(newClassName)}</code>
                    </p>
                  )}
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground">
                    <Palette className="h-3.5 w-3.5 inline mr-1" />
                    This class will include all current style settings from the Layout, Typography, Background, Border, and Effects tabs.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewClassDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClass}>
                  <Check className="h-4 w-4 mr-1" />
                  Create & Apply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <CollapsibleContent className="mt-3 space-y-3">
          {/* Applied Classes */}
          {appliedClasses.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {appliedClasses.map((className) => (
                <Badge
                  key={className}
                  variant="secondary"
                  className="text-xs gap-1 pr-1"
                >
                  <span className="text-blue-600 dark:text-blue-400">.</span>
                  {className}
                  <button
                    onClick={() => handleRemoveClass(className)}
                    className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add Class Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 justify-start text-xs gap-1">
                <Plus className="h-3 w-3" />
                Add existing class...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <div className="p-2 border-b">
                <Input
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  placeholder="Search classes..."
                  className="h-8 text-sm"
                />
              </div>
              <ScrollArea className="h-48">
                {filteredClasses.length > 0 ? (
                  <div className="p-1">
                    {filteredClasses.map((cls) => (
                      <button
                        key={cls.name}
                        onClick={() => handleAddClass(cls.name)}
                        disabled={appliedClasses.includes(cls.name)}
                        className={cn(
                          'w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors',
                          'hover:bg-muted',
                          appliedClasses.includes(cls.name) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs">
                            <span className="text-blue-600 dark:text-blue-400">.</span>
                            {cls.name}
                          </span>
                          {appliedClasses.includes(cls.name) && (
                            <Check className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                        {cls.label && cls.label !== cls.name && (
                          <p className="text-xs text-muted-foreground truncate">
                            {cls.label}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {classSearch ? 'No classes found' : 'No classes created yet'}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Property source indicator info */}
          {appliedClasses.length > 0 && (
            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
                Properties from classes are shown with a blue indicator in style tabs
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  </TooltipProvider>
  );
}
