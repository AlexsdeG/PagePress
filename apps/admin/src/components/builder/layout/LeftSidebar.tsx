// PagePress v0.0.5 - 2025-11-30
// Left sidebar with toolbox and layers

import { useEditor, Element } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBuilderStore, type SidebarPanel } from '@/stores/builder';
import { Container, Text, Heading, BuilderImage, BuilderButton, HTMLBlock } from '../index';

/**
 * Toolbox item component
 */
interface ToolboxItemProps {
  icon: string;
  label: string;
  description: string;
  onCreate: () => void;
}

function ToolboxItem({ icon, label, description, onCreate }: ToolboxItemProps) {
  return (
    <button
      onClick={onCreate}
      className="w-full p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

/**
 * Toolbox panel with draggable components
 */
function Toolbox() {
  const { connectors, query } = useEditor();

  const components = [
    {
      icon: '📦',
      label: 'Container',
      description: 'Flex/Grid layout container',
      element: <Element is={Container} canvas />,
    },
    {
      icon: '📝',
      label: 'Text',
      description: 'Paragraph text block',
      element: <Text text="Edit this text" />,
    },
    {
      icon: '🔤',
      label: 'Heading',
      description: 'H1-H6 heading',
      element: <Heading text="Heading" />,
    },
    {
      icon: '🖼️',
      label: 'Image',
      description: 'Image with options',
      element: <BuilderImage />,
    },
    {
      icon: '🔘',
      label: 'Button',
      description: 'Interactive button',
      element: <BuilderButton text="Click me" />,
    },
    {
      icon: '</>',
      label: 'HTML Block',
      description: 'Custom HTML code',
      element: <HTMLBlock />,
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Drag components to the canvas
      </p>
      {components.map((component) => (
        <div
          key={component.label}
          ref={(ref) => {
            if (ref) {
              connectors.create(ref, component.element);
            }
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          <ToolboxItem
            icon={component.icon}
            label={component.label}
            description={component.description}
            onCreate={() => {}}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Custom layer item component
 */
function LayerItem() {
  return (
    <div className="text-sm">
      <Layers />
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
      <div className="w-12 border-r bg-background flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLeftSidebarOpen(true)}
          className="mb-2"
        >
          ➤
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-sm">Components</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLeftSidebarOpen(false)}
        >
          ◀
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeLeftPanel}
        onValueChange={(v) => setActiveLeftPanel(v as SidebarPanel)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="components" className="flex-1 text-xs">
            Components
          </TabsTrigger>
          <TabsTrigger value="layers" className="flex-1 text-xs">
            Layers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="flex-1 overflow-auto p-4">
          <Toolbox />
        </TabsContent>

        <TabsContent value="layers" className="flex-1 overflow-auto p-4">
          <LayerItem />
        </TabsContent>
      </Tabs>
    </div>
  );
}
