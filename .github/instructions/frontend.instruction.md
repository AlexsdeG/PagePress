---
applyTo: "apps/admin/**"
---

# Frontend Instructions — React Admin (`apps/admin`)

## Architecture

The admin panel is a **React 19** SPA built with **Vite**, **Tailwind CSS 4**, and **Shadcn/UI**. The page builder uses **Craft.js**.

### File Layout
```
apps/admin/src/
├── App.tsx                 # Router setup with ProtectedRoute
├── main.tsx                # React root entry
├── index.css               # Tailwind imports + global styles
├── components/
│   ├── builder/            # Craft.js page builder (core feature)
│   │   ├── components/     # Draggable elements (Button, Container, Text, etc.)
│   │   ├── editor/         # Editor chrome (toolbar, sidebar frames)
│   │   ├── inspector/      # Right sidebar settings panels
│   │   ├── responsive/     # Breakpoint system
│   │   ├── layout/         # Editor layout wrappers
│   │   ├── page/           # Page-level settings
│   │   ├── context/        # BuilderContext for save/state
│   │   ├── hooks/          # Builder-specific hooks
│   │   ├── utils/          # Style resolution, serialization helpers
│   │   ├── types/          # Builder type definitions
│   │   ├── global/         # Global theme settings
│   │   ├── resolver.ts     # Craft.js component resolver map
│   │   ├── types.ts        # Shared builder types
│   │   └── index.ts        # Barrel exports
│   └── ui/                 # Shadcn/UI primitives (button, dialog, input, etc.)
├── hooks/
│   ├── useAuth.ts          # Auth state hook
│   └── usePageBuilder.ts   # Builder initialization hook
├── lib/
│   ├── api.ts              # Fetch wrapper for API calls
│   └── utils.ts            # cn() helper and utilities
├── pages/
│   ├── Builder.tsx          # Page builder route
│   ├── Dashboard.tsx        # Home dashboard
│   ├── Pages.tsx            # Page management list
│   ├── Media.tsx            # Media library
│   ├── Settings.tsx         # Site settings
│   ├── Login.tsx            # Auth
│   └── Register.tsx         # Auth
└── stores/
    ├── auth.ts              # Zustand auth store
    └── builder.ts           # Zustand builder state store
```

### Key Patterns

**Imports:** Always use the `@/` path alias (maps to `src/`).

```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
```

**State Management:** Zustand 5 with flat stores and selectors.

```typescript
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Usage — always use selectors:
const user = useAuthStore((s) => s.user);
```

**Data Fetching:** TanStack React Query 5 with the API client in `lib/api.ts`.

**UI Components:** Use Shadcn/UI from `@/components/ui/`. Use `cn()` from `@/lib/utils` for conditional class merging. Don't build custom versions of components that already exist in Shadcn.

**Forms:** React Hook Form + Zod resolver for validation.

---

## Builder Architecture (Craft.js)

### Component Pattern
Every builder component has 3 parts:

1. **Component file** (`Button.tsx`) — the rendered element:
```typescript
import { useNode } from '@craftjs/core';

export const Button = ({ text, ...props }) => {
  const { connectors: { connect, drag } } = useNode();
  return (
    <button ref={(ref) => connect(drag(ref))} {...props}>
      {text}
    </button>
  );
};

Button.craft = {
  displayName: 'Button',
  related: { settings: ButtonSettings },
  props: { text: 'Click me' },
};
```

2. **Settings file** (`Button.settings.tsx`) — right-sidebar property editor.

3. **Craft config** — `ComponentName.craft` defines `displayName`, `related.settings`, and default `props`.

### Resolver
All builder components must be registered in `apps/admin/src/components/builder/resolver.ts` — this map tells Craft.js how to deserialize saved pages.

### Responsive System
- 4 breakpoints: Desktop (base), Tablet (<992px), Mobile (<768px), Portrait (<479px).
- Styles cascade downward — smaller breakpoints inherit from larger unless overridden.
- Visual yellow dot indicators show when a value differs from desktop.

### Pseudo-State System
- Elements support hover, active, focus pseudo-state styles.
- Styles stored per-state and applied via the builder's style resolution system.

### Class System
- Reusable style classes (like Bricks Builder).
- Blue dot indicators show which settings come from a class vs. manual overrides.

### Key Builder Files
- `BuilderElementWrapper.tsx` — wraps every element with selection/hover/drag chrome.
- `resolver.ts` — maps component names to component classes for serialization.
- `stores/builder.ts` — Zustand store for editor state (sidebar, preview mode, etc.).
- `context/` — React context for save operations and builder state.

### Adding a New Builder Component
1. Create `apps/admin/src/components/builder/components/{Name}.tsx` with `useNode()`.
2. Create `apps/admin/src/components/builder/components/{Name}.settings.tsx`.
3. Define `.craft` config with `displayName`, `related.settings`, default `props`.
4. Wrap with `React.memo` to prevent re-renders during drag.
5. Register in `resolver.ts`.
6. Add to the component panel categories in the left sidebar.

---

## Styling

- **Tailwind CSS 4** for all admin UI.
- **Shadcn/UI** components use `class-variance-authority` for variants.
- Builder canvas content uses the responsive style system (not direct Tailwind classes).
- Global theme settings inject CSS variables into the canvas wrapper.