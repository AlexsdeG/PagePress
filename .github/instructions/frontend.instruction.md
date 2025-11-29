# Admin & Builder Instructions (Frontend)

## State Management (Zustand)
Do not use Redux. Use Zustand for managing the "Editor State" (e.g., Is the sidebar open? Which element is currently selected? Is the preview mode active?).

## The Builder Engine (Craft.js)
The builder is the core of this project.

### Component Structure
Each draggable component must have:
1.  **The Component:** The React code that renders (e.g., `<h2>{text}</h2>`).
2.  **The Settings:** A React component showing the inputs for the right sidebar.
3.  **Default Props:** Initial state.

**Example `Button` Component Wrapper:**
```tsx
import { useNode } from '@craftjs/core';

export const Button = ({ text, color, ...props }) => {
  const { connectors: { connect, drag } } = useNode();
  return (
    <button ref={ref => connect(drag(ref))} className={`btn ${color}`} {...props}>
      {text}
    </button>
  );
};

Button.craft = {
  related: {
    settings: ButtonSettings, // The Right Sidebar component
  },
  props: {
    text: "Click me",
    color: "bg-blue-500"
  }
};
```

## Plugin System (Frontend)
We need a way to inject UI into the Admin without changing core code.

**Registry Implementation:**
```typescript
// lib/plugin-registry.ts
type PluginComponent = React.ComponentType<any>;

class PluginRegistry {
    slots: Record<string, PluginComponent[]> = {};

    registerComponent(slotName: string, component: PluginComponent) {
        if (!this.slots[slotName]) this.slots[slotName] = [];
        this.slots[slotName].push(component);
    }

    getComponents(slotName: string) {
        return this.slots[slotName] || [];
    }
}
export const plugins = new PluginRegistry();
```

**Slots to Implement:**
1.  `dashboard.widget` (Add widgets to home dashboard).
2.  `editor.toolbar.action` (Add buttons to the builder top bar).
3.  `editor.inspector.tab` (Add tabs to the right sidebar).

## Styling & Theme
- Use **Tailwind CSS** for the Admin UI itself.
- For the *User's Content* (inside the Canvas), we must ensure Tailwind styles are loaded inside the iframe or shadow DOM.
- **Global Styles:** Store color palettes in a Zustand store and inject them as CSS Variables (`--primary-color: #ff0000`) into the Canvas wrapper.

## Folder Structure (Frontend)
```
/src
  /components
    /builder     # All Craft.js User Components (Text, Image, Container)
    /editor      # The Editor UI (Sidebar, Topbar, Layers)
    /ui          # Shadcn UI primitives
  /hooks         # Custom React Hooks
  /lib           # Utils, PluginRegistry, API Client
  /pages         # Admin Routes (Dashboard, Login, Settings)
  /stores        # Zustand Stores
```