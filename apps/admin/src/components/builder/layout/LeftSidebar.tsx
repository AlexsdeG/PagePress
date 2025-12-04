// PagePress v0.0.6 - 2025-12-03
// Left sidebar with toolbox and layers

import { useState, useMemo } from 'react';
import { useEditor, Element } from '@craftjs/core';
import { 
  Box, 
  Type, 
  Heading1, 
  Image as ImageIcon, 
  MousePointer2, 
  Code2,
  Search,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Layers,
  PanelLeftClose,
  PanelLeft,
  Square,
  Columns,
  Rows,
  Minus,
  MoveVertical,
  Circle,
  LayoutDashboard,
  Link2,
  ListOrdered,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore, type SidebarPanel } from '@/stores/builder';
import { 
  Container, Text, Heading, BuilderImage, BuilderButton, HTMLBlock,
  Section, Row, Column, Div,
  Divider, Spacer, Icon, IconBox, Link, List,
  Video as BuilderVideo,
} from '../index';
import { StructureTree } from './StructureTree';
import { cn } from '@/lib/utils';

/**
 * Component definition for the toolbox
 */
interface ComponentDef {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  category: 'layout' | 'basic' | 'media' | 'advanced';
  element: React.ReactElement;
}

/**
 * All available components organized by category
 */
const COMPONENTS: ComponentDef[] = [
  // Layout Components
  {
    id: 'container',
    icon: Box,
    label: 'Container',
    description: 'Flex/Grid layout wrapper',
    category: 'layout',
    element: <Element is={Container} canvas />,
  },
  {
    id: 'section',
    icon: LayoutDashboard,
    label: 'Section',
    description: 'Full-width page section',
    category: 'layout',
    element: <Element is={Section} canvas />,
  },
  {
    id: 'row',
    icon: Columns,
    label: 'Row',
    description: 'Horizontal flex container',
    category: 'layout',
    element: <Element is={Row} canvas />,
  },
  {
    id: 'column',
    icon: Rows,
    label: 'Column',
    description: 'Flex column item',
    category: 'layout',
    element: <Element is={Column} canvas />,
  },
  {
    id: 'div',
    icon: Square,
    label: 'Div',
    description: 'Generic wrapper block',
    category: 'layout',
    element: <Element is={Div} canvas />,
  },
  // Basic Components
  {
    id: 'text',
    icon: Type,
    label: 'Text',
    description: 'Paragraph text block',
    category: 'basic',
    element: <Text text="Edit this text" />,
  },
  {
    id: 'heading',
    icon: Heading1,
    label: 'Heading',
    description: 'H1-H6 heading',
    category: 'basic',
    element: <Heading text="Heading" />,
  },
  {
    id: 'button',
    icon: MousePointer2,
    label: 'Button',
    description: 'Interactive button',
    category: 'basic',
    element: <BuilderButton text="Click me" />,
  },
  {
    id: 'divider',
    icon: Minus,
    label: 'Divider',
    description: 'Horizontal line separator',
    category: 'basic',
    element: <Divider />,
  },
  {
    id: 'spacer',
    icon: MoveVertical,
    label: 'Spacer',
    description: 'Vertical spacing block',
    category: 'basic',
    element: <Spacer height="40px" />,
  },
  {
    id: 'icon',
    icon: Circle,
    label: 'Icon',
    description: 'Lucide icon display',
    category: 'basic',
    element: <Icon iconName="Star" />,
  },
  {
    id: 'iconbox',
    icon: LayoutGrid,
    label: 'Icon Box',
    description: 'Icon with title and text',
    category: 'basic',
    element: <IconBox iconName="Star" heading="Feature Title" />,
  },
  {
    id: 'link',
    icon: Link2,
    label: 'Link',
    description: 'Styled anchor link',
    category: 'basic',
    element: <Link text="Click here" href="#" />,
  },
  {
    id: 'list',
    icon: ListOrdered,
    label: 'List',
    description: 'Bullet or numbered list',
    category: 'basic',
    element: <List />,
  },
  // Media Components
  {
    id: 'image',
    icon: ImageIcon,
    label: 'Image',
    description: 'Image with options',
    category: 'media',
    element: <BuilderImage />,
  },
  {
    id: 'video',
    icon: Video,
    label: 'Video',
    description: 'YouTube/Vimeo/MP4 embed',
    category: 'media',
    element: <BuilderVideo />,
  },
  // Advanced Components
  {
    id: 'html',
    icon: Code2,
    label: 'Code Block',
    description: 'Custom HTML/CSS/JS',
    category: 'advanced',
    element: <HTMLBlock />,
  },
];

/**
 * Category labels and order
 */
const CATEGORIES = [
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
  { id: 'basic', label: 'Basic', icon: Type },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'advanced', label: 'Advanced', icon: Code2 },
] as const;

/**
 * Single component item in the grid
 */
interface ComponentItemProps {
  component: ComponentDef;
  viewMode: 'grid' | 'list';
}

function ComponentItem({ component, viewMode }: ComponentItemProps) {
  const { connectors } = useEditor();
  const Icon = component.icon;

  if (viewMode === 'grid') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={(ref) => {
              if (ref) {
                connectors.create(ref, component.element);
              }
            }}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-lg border bg-card',
              'hover:bg-accent hover:border-primary/50 cursor-grab active:cursor-grabbing',
              'transition-colors aspect-square'
            )}
          >
            <Icon className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-xs font-medium text-center">{component.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-medium">{component.label}</p>
          <p className="text-xs text-muted-foreground">{component.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connectors.create(ref, component.element);
        }
      }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card',
        'hover:bg-accent hover:border-primary/50 cursor-grab active:cursor-grabbing',
        'transition-colors'
      )}
    >
      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{component.label}</p>
        <p className="text-xs text-muted-foreground truncate">{component.description}</p>
      </div>
    </div>
  );
}

/**
 * Category section with collapsible components
 */
interface CategorySectionProps {
  category: typeof CATEGORIES[number];
  components: ComponentDef[];
  viewMode: 'grid' | 'list';
  defaultOpen?: boolean;
}

function CategorySection({ category, components, viewMode, defaultOpen = true }: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = category.icon;

  if (components.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-1 hover:bg-muted/50 rounded-md group">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{category.label}</span>
          <span className="text-xs text-muted-foreground">({components.length})</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn(
          'py-2',
          viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'
        )}>
          {components.map((component) => (
            <ComponentItem key={component.id} component={component} viewMode={viewMode} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Toolbox panel with draggable components
 */
function Toolbox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter components based on search
  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return COMPONENTS;
    const query = searchQuery.toLowerCase();
    return COMPONENTS.filter(
      (c) =>
        c.label.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Prevent drops when dragging elements back over the toolbox
  const handlePreventDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'none';
  };

  // Group by category
  const componentsByCategory = useMemo(() => {
    const grouped: Record<string, ComponentDef[]> = {};
    for (const category of CATEGORIES) {
      grouped[category.id] = filteredComponents.filter((c) => c.category === category.id);
    }
    return grouped;
  }, [filteredComponents]);

  return (
    <div 
      className="flex flex-col h-full"
      onDragOver={handlePreventDrop}
      onDrop={handlePreventDrop}
    >
      {/* Search and view toggle */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {filteredComponents.length} components
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode('list')}
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Components by category */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {CATEGORIES.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              components={componentsByCategory[category.id] || []}
              viewMode={viewMode}
            />
          ))}
          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No components match your search
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Drag hint */}
      <div className="p-3 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Drag components to the canvas
        </p>
      </div>
    </div>
  );
}

/**
 * Left sidebar component
 */
export function LeftSidebar() {
  const {
    leftSidebarOpen,
    setLeftSidebarOpen,
    activeLeftPanel,
    setActiveLeftPanel,
  } = useBuilderStore();

  if (!leftSidebarOpen) {
    return (
      <div className="w-12 border-r bg-background flex flex-col items-center py-4 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftSidebarOpen(true)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Open Sidebar</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="font-semibold text-sm">Elements</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setLeftSidebarOpen(false)}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeLeftPanel}
        onValueChange={(v) => setActiveLeftPanel(v as SidebarPanel)}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="mx-3 mt-2 grid grid-cols-2">
          <TabsTrigger value="components" className="text-xs gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" />
            Elements
          </TabsTrigger>
          <TabsTrigger value="layers" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="flex-1 m-0 overflow-hidden">
          <Toolbox />
        </TabsContent>

        <TabsContent value="layers" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <StructureTree />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
