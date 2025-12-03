# Master Project Plan: "PagePress" Web Site Builder

> **Version:** 0.2.0 (Bricks-Inspired Update)  
> **Last Updated:** 2025-12-03  
> **Status:** ✅ Done | 🔄 Partial | 🐛 Has Bugs | ❌ Not Started

---

## Phase 1: Foundation & Infrastructure
**Goal:** Monorepo, Docker, Database, API health.
**Status:** ✅ Complete

- [x] **Repo Setup:** pnpm monorepo with workspaces
- [x] **Docker:** `docker-compose.yml` with API, Admin, SQLite volume
- [x] **Database:**
    - [x] Drizzle ORM with SQLite (libsql)
    - [x] Schema: `users`, `sessions`, `site_settings`, `pages`, `media`
- [x] **Backend Core:**
    - [x] Fastify server with TypeScript
    - [x] Pino logger (Fastify built-in)
    - [x] Zod env validation (`lib/env.ts`)
    - [x] Health routes (`/health`, `/health/live`, `/health/ready`)
- [x] **Frontend Core:**
    - [x] Vite + React + TypeScript + Tailwind CSS v4
    - [x] Shadcn/UI with `cn` utility
    - [x] Path aliases (`@/`)

---

## Phase 2: Authentication & Security
**Goal:** Secure admin panel with modern standards.
**Status:** ✅ Complete

- [x] **Auth Implementation:**
    - [x] Custom session-based auth with bcrypt
    - [x] Routes: `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me`
    - [x] HTTP-Only cookies (Strict, Secure in production)
    - [x] Session persistence in database
- [x] **Admin UI Auth:**
    - [x] Login/Register pages with form validation
    - [x] `ProtectedRoute` wrapper component
    - [x] Zustand auth store
- [x] **Security:**
    - [x] `@fastify/helmet` (security headers)
    - [x] `@fastify/rate-limit` (100 req/min)
    - [x] `@fastify/cookie` for sessions

---

## Phase 3: Dashboard & CMS Logic
**Goal:** Manage pages, media, settings outside builder.
**Status:** 🔄 Mostly Complete

- [x] **Database:** Pages and media tables
- [x] **API - Content:**
    - [x] Pages CRUD with Zod validation
    - [x] Slug auto-generation (`lib/slug.ts`)
    - [x] Pagination, filtering, sorting
    - [x] Media upload with `@fastify/multipart`
    - [x] Static file serving (`@fastify/static`)
- [x] **API - Settings:**
    - [x] GET/PUT `/settings` endpoints
- [x] **Admin Dashboard:**
    - [x] Dashboard home with stats
    - [x] Page list with DataTable
    - [x] Create/Edit/Delete dialogs
    - [x] Media library grid with drag-drop upload
    - [x] Settings page
- [ ] **Missing:**
    - [ ] Users management page
    - [ ] Role-based permission display
    - [ ] invite url, first time setup you can create account, after first time setup, var in a created config file or .env file, for admin backend page "/admin". login page remove create account option.
    - [ ] users dispaly eg who created which pages, tempalte, logs of all actions
    - [ ] email and username login, emial code when changing email or for admin first account setup
    - [ ] forgot pw and jwt token login when saved otherwise username/email and password
    - [ ] update all backend admin routes to /admin/... (eg /admin/dashboard)
    - [ ] seperate pages from tempaltes and other, only pages can be dispalyed on the forntend, everything else has to be part or dispalyed on a page

---

## Phase 4A: Builder Critical Fixes
**Goal:** Fix blocking bugs and core functionality.
**Status:** ✅ Complete

### Save System
- [x] Auto-save infrastructure exists
- [x] ✅ **FIXED:** Save button now works with BuilderContext
- [x] ✅ **FIXED:** Removed `window.__builderSave` hack, using React context
- [x] Implement save flow: `query.serialize()` → API PUT
- [x] Toast notifications for save success/error (Sonner installed)
- [x] Unsaved changes warning on page navigation (with AlertDialog)

### Keyboard Shortcuts
- [x] Ctrl+S to save
- [x] Ctrl+Z / Ctrl+Y for undo/redo
- [x] Delete/Backspace to remove selected
- [x] Escape to deselect
- [x] Ctrl+D to duplicate

### Media Integration
- [x] ✅ **FIXED:** Image component has media library picker
- [x] MediaPickerDialog component created
- [x] Thumbnail preview in image settings

---

## Phase 4B: Builder Core UX (Bricks-Inspired)
**Goal:** Visual feedback and interaction polish.
**Status:** ❌ Not Started

### Element Visual States (HIGH PRIORITY)
- [ ] **Hover Outline:** Light dashed border on element hover
- [ ] **Selection Highlight:** Solid border with corner handles on selected
- [ ] **Parent Highlight:** Subtle outline on parent when child selected
- [ ] **Debug/Wireframe Mode:** Toggle to show all container boundaries
- [ ] **Spacing Visualizer:** Color-coded margin (orange) / padding (green)

### Drag & Drop Feedback
- [ ] **Drop Zones:** Blue highlighted areas when dragging
- [ ] **Drop Indicators:** Line showing insertion point
- [ ] **Drag Ghost:** Semi-transparent preview of dragged element
- [ ] **Auto-scroll:** Scroll canvas when dragging near edges
- [ ] **Cannot Drop:** Red indicator for invalid drop targets

### Selection & Navigation
- [ ] **Breadcrumb Bar:** Show hierarchy (Section > Container > Heading), click to select parent
- [ ] **Floating Toolbar:** Quick actions on selected element (duplicate, delete, move up/down)
- [ ] **Right-click Context Menu:** Copy, Paste, Duplicate, Delete, Move, Wrap in Container
- [ ] **Arrow Key Navigation:** Navigate between siblings with arrow keys

### Left Sidebar Improvements
- [ ] **Component Grid:** 2-column grid with icons (like Bricks)
- [ ] **Component Categories:** Collapsible: Layout, Basic, General, Media
- [ ] **Search Filter:** Filter components by name
- [ ] **Component Tooltips:** Show description on hover

### Right Sidebar Improvements
- [ ] **Structure Panel:** Styled tree view with icons per component type
- [ ] **Drag Reorder:** Reorder elements via drag in structure panel
- [ ] **Quick Actions:** Rename, hide, delete, duplicate buttons
- [ ] **Collapse/Expand:** Collapse container children in tree

---

## Phase 5: Component Expansion
**Goal:** Essential Bricks-like components.
**Status:** ❌ Not Started

### Layout Components
- [ ] **Section:** Full-width wrapper with semantic `<section>` tag
    - Content width control (boxed/full)
    - Vertical alignment
    - Min-height (vh/px)
- [ ] **Row:** Horizontal flex container for columns
- [ ] **Column:** Flex item with responsive width controls
    - Width: auto, %, px, fr (for grid)
    - Order control
- [ ] **Div:** Generic wrapper with custom HTML tag selector

### Basic Components
- [ ] **Divider:** Horizontal line with style, width, color
- [ ] **Spacer:** Invisible height block (px/vh)
- [ ] **Icon:** Lucide icon picker with size, color
- [ ] **Icon Box:** Icon + heading + text combo
- [ ] **Link/Text Link:** Styled anchor with hover states
- [ ] **List:** UL/OL with bullet/number style options

### Media Components
- [ ] **Video:** YouTube, Vimeo, MP4 with poster image
- [ ] **Video Popup:** Lightbox video on button click

### Update Existing Components
- [ ] **Container:** Add HTML tag selector (div, section, article, aside, nav, header, footer)
- [ ] **Heading:** Add link option
- [ ] **Button:** Add icon before/after text

---

## Phase 6: Advanced Styling System
**Goal:** Bricks-level style controls.
**Status:** ❌ Not Started

### Layout Settings (Add to all components)
- [ ] **Position:** Static, Relative, Absolute, Fixed, Sticky
- [ ] **Z-index:** Numeric input with presets
- [ ] **Overflow:** Visible, Hidden, Scroll, Auto
- [ ] **Display:** Block, Flex, Grid, Inline, None

### Background Settings
- [ ] **Gradient:** Linear/Radial with angle, stops
- [ ] **Background Image:** Media picker, size, position, repeat
- [ ] **Background Video:** MP4 with poster fallback
- [ ] **Overlay:** Color overlay with opacity

### Border & Effects
- [ ] **Box Shadow:** Multiple shadows with inset option
- [ ] **Text Shadow:** X, Y, Blur, Color
- [ ] **Filters:** Blur, Brightness, Contrast, Grayscale, Saturate
- [ ] **Backdrop Filter:** Blur, Brightness for glass effects

### Transform & Transitions
- [ ] **Transform:** Translate, Rotate, Scale, Skew (with units)
- [ ] **Transform Origin:** 9-point selector
- [ ] **Transition:** Property, Duration, Easing, Delay

### Typography Expansion
- [ ] **Font Family:** Google Fonts picker or custom stack
- [ ] **Text Transform:** Uppercase, Lowercase, Capitalize
- [ ] **Text Decoration:** Underline, Overline, Line-through
- [ ] **Word/Letter Spacing:** Fine-tune controls

---

## Phase 7: Responsive Design System
**Goal:** Per-breakpoint styling like Bricks.
**Status:** ❌ Not Started

### Breakpoint Architecture
- [ ] **Store styles per breakpoint:** Desktop (base), Tablet (<992px), Mobile (<768px), Mobile Portrait (<479px)
- [ ] **Visual Indicator:** Icon showing if value differs from desktop
- [ ] **Inheritance:** Values cascade down from larger breakpoints
- [ ] **Reset to Desktop:** Button to remove breakpoint-specific value

### Responsive Controls
- [ ] **Per-property breakpoint toggle:** Click to set mobile-specific value
- [ ] **Hide on breakpoint:** Toggle visibility per device
- [ ] **Responsive spacing:** Different padding/margin per breakpoint
- [ ] **Responsive typography:** Different font sizes per breakpoint

### Preview Enhancements
- [ ] **Device Frames:** Visual phone/tablet frame around canvas
- [ ] **Orientation Toggle:** Portrait/Landscape for mobile
- [ ] **Accurate Dimensions:** Match real device sizes

---

## Phase 8: Rich Text & Code Editing
**Goal:** Professional content editing.
**Status:** ❌ Not Started

### TipTap Integration (Text Component)
- [ ] **Inline Editing:** Click text to edit directly on canvas
- [ ] **Floating Toolbar:** Bold, Italic, Underline, Strikethrough
- [ ] **Links:** Add/edit/remove links with URL input
- [ ] **Lists:** Toggle bullet/numbered lists
- [ ] **Text Align:** Left, Center, Right, Justify
- [ ] **Headings:** Convert to H1-H6 within text
- [ ] **Clear Formatting:** Remove all styles

### Monaco Editor (HTMLBlock & Custom CSS)
- [ ] **Syntax Highlighting:** HTML, CSS, JavaScript
- [ ] **Autocomplete:** Tag and property suggestions
- [ ] **Error Highlighting:** Invalid syntax markers
- [ ] **Format Document:** Auto-prettify code
- [ ] **Custom CSS Input:** Per-element `<style>` block

### Custom Attributes (Bricks Feature)
- [ ] **Attributes Panel:** Add custom HTML attributes
- [ ] **Name/Value Inputs:** e.g., `role="banner"`, `data-section="hero"`
- [ ] **Preset Attributes:** Common ARIA attributes dropdown

---

## Phase 9: Advanced Components
**Goal:** Interactive and dynamic components.
**Status:** ❌ Not Started

### Interactive Components
- [ ] **Accordion:** Collapsible panels with open/close animation
- [ ] **Tabs:** Horizontal/vertical tab navigation
- [ ] **Toggle/Switch:** On/off with custom labels
- [ ] **Modal/Popup:** Trigger on click, exit intent, timer
- [ ] **Tooltip:** Hover text with position options

### Form Components
- [ ] **Form Container:** Action URL, method, AJAX toggle
- [ ] **Input:** Text, Email, Password, Number, Tel, URL
- [ ] **Textarea:** Multi-line with rows control
- [ ] **Select:** Dropdown with options builder
- [ ] **Checkbox/Radio:** Single and group
- [ ] **Submit Button:** Loading state, success message
- [ ] **Form Validation:** Required, pattern, min/max

### Navigation Components
- [ ] **Nav Menu:** Horizontal/vertical with dropdowns
- [ ] **Breadcrumbs:** Auto-generate from page hierarchy
- [ ] **Sidebar/Drawer:** Off-canvas panel
- [ ] **Search:** Input with results dropdown

### Content Components
- [ ] **Slider/Carousel:** Multi-slide with dots/arrows
- [ ] **Image Gallery:** Grid with lightbox
- [ ] **Counter:** Animated number with suffix/prefix
- [ ] **Progress Bar:** Percentage with animation
- [ ] **Alert/Notice:** Info, Warning, Error, Success styles
- [ ] **Pricing Table:** Columns with features list
- [ ] **Testimonial:** Quote with author and image
- [ ] **Team Member:** Photo, name, role, social links
- [ ] **Social Icons:** Icon set with links

---

## Phase 10: Template System
**Goal:** Reusable headers, footers, sections.
**Status:** ❌ Not Started

### System Templates
- [ ] **Header Template:** Auto-inject at page top
- [ ] **Footer Template:** Auto-inject at page bottom
- [ ] **404 Template:** Custom not-found page
- [ ] **Template Selector:** Assign template per page

### Section Templates (Library)
- [ ] **Save as Template:** Save any element/group as reusable
- [ ] **Template Library:** Browse and insert saved templates
- [ ] **Categories:** Hero, Features, CTA, Contact, etc.
- [ ] **Import/Export:** JSON template files
- [ ] **Starter Templates:** Pre-built full-page layouts

### Template Variables (Dynamic)
- [ ] **Variable Syntax:** `{{variable_name}}` in text
- [ ] **Variable Editor:** UI to fill in variables when inserting
- [ ] **Default Values:** Fallback if variable not set
- [ ] **Image Variables:** Dynamic image placeholders

### Global Elements
- [ ] **Mark as Global:** Sync changes across all instances
- [ ] **Global Indicator:** Visual badge on global elements
- [ ] **Unlink:** Convert global to local instance

---

## Phase 11: Dynamic Data & Conditions
**Goal:** Data-driven content like Bricks.
**Status:** ❌ Not Started

### Dynamic Data Fields
- [ ] **Dynamic Tag Button:** Lightning icon on text/image inputs
- [ ] **Data Sources:**
    - Site Title, Description, URL
    - Page Title, Slug, Date, Author
    - Current User Name, Email, Role
    - Custom Fields (future)
- [ ] **Fallback Values:** Default if data empty

### Conditional Visibility
- [ ] **Conditions Panel:** Show element if...
- [ ] **Condition Types:**
    - User logged in / logged out
    - User role equals
    - Page is homepage
    - Device is mobile/tablet/desktop
    - Custom field equals/contains
- [ ] **AND/OR Logic:** Multiple conditions

### Query Loop (Future)
- [ ] **Loop Container:** Repeat children for each post
- [ ] **Query Builder:** Post type, category, limit, order
- [ ] **Pagination:** Load more, page numbers

---

## Phase 12: Public Renderer (Frontend)
**Goal:** Display built pages as fast HTML.
**Status:** ❌ Not Started

### URL Structure
- [ ] `/` → Homepage (configurable)
- [ ] `/:slug` → Dynamic page routing
- [ ] `/pp-admin/*` → Admin panel
- [ ] API at `/api/*` or separate port

### Render Engine
- [ ] **JSON to HTML:** Render-only component variants
- [ ] **Server-Side Render:** React `renderToString`
- [ ] **Inject Templates:** Header/Footer auto-insertion
- [ ] **Static Export (Optional):** Pre-render to HTML files

### SEO & Meta
- [ ] **Per-Page SEO:** Title, meta description in page settings
- [ ] **OG Tags:** Image, title, description for social
- [ ] **Canonical URLs:** Prevent duplicate content
- [ ] **Robots.txt & Sitemap.xml:** Auto-generation

### Performance
- [ ] **Critical CSS:** Inline above-fold styles
- [ ] **Lazy Loading:** Images load on scroll
- [ ] **Asset Optimization:** Minify CSS/JS

---

## Phase 13: Quality of Life
**Goal:** Professional admin experience.
**Status:** ❌ Not Started

### User Management
- [ ] **Users Page:** List, create, edit, delete users
- [ ] **Roles:** Admin (full), Editor (pages only), Viewer (read-only)
- [ ] **Invite System:** Generate invite links (default mode)
- [ ] **Profile Page:** Change username, email, password, avatar

### Notifications
- [ ] **Toast System:** Install Sonner
- [ ] **Success/Error/Info toasts** for all actions
- [ ] **Confirmation Dialogs:** Delete confirmations
- [ ] **Unsaved Warning:** Block navigation with changes

### Settings Expansion
- [ ] **Categories:** General, Appearance, SEO, Advanced
- [ ] **Appearance:** Logo, favicon, global colors
- [ ] **Advanced:** Custom head/footer code injection
- [ ] **Apply to Frontend:** Settings used in renderer

---

## Phase 14: Extensibility (Plugin System)
**Goal:** WordPress-like hooks and filters.
**Status:** ❌ Not Started

### Backend Events
- [ ] **Event Bus:** Install `mitt`
- [ ] **Events:** `page.beforeSave`, `page.afterSave`, `page.beforeRender`
- [ ] **Events:** `media.afterUpload`, `settings.afterUpdate`

### Frontend Slots
- [ ] **Plugin Manager:** Singleton registry
- [ ] **Slot Locations:** Sidebar.Top, Sidebar.Bottom, Inspector.Bottom, TopBar.Right
- [ ] **Register API:** `registerPlugin({ slot, component })`

### Custom Components API
- [ ] **Register Component:** Add new builder components
- [ ] **Component Config:** Icon, label, category, defaults, settings panel

### Shortcodes
- [ ] **Syntax:** `[shortcode attr="value"]`
- [ ] **Parser:** Find and replace in rendered HTML
- [ ] **Registry:** Map shortcode names to components

---

## Phase 15: Production & DevOps
**Goal:** Production-ready deployment.
**Status:** ❌ Not Started

### Docker Production
- [ ] **Multi-stage Builds:** Optimized images
- [ ] **Compose Profiles:** Dev vs Production
- [ ] **Nginx:** Optional reverse proxy config

### Environment & Security
- [ ] **Secure Cookies:** Production settings
- [ ] **CORS:** Configurable origins
- [ ] **Secrets:** Documented env vars

### Monitoring
- [ ] **Structured Logging:** JSON logs in production
- [ ] **Health Checks:** Docker health commands
- [ ] **Error Tracking:** Optional Sentry integration

### Backup
- [ ] **Database Backup:** SQLite backup script
- [ ] **Media Backup:** Uploads directory

---

## Priority Implementation Order

### Week 1-2: Critical Fixes (Phase 4A)
1. Fix save button and remove `window.__builderSave`
2. Install Sonner for toast notifications
3. Add keyboard shortcuts
4. Media library picker for Image component
5. Unsaved changes warning

### Week 3-4: Core UX (Phase 4B)
1. Element hover/selection outlines
2. Drop zone indicators
3. Floating toolbar with quick actions
4. Right-click context menu
5. Breadcrumb navigation

### Week 5-6: Component Expansion (Phase 5)
1. Section and Row/Column components
2. Divider, Spacer, Icon components
3. Video component
4. Update Container with HTML tag selector

### Week 7-8: Advanced Styling (Phase 6)
1. Box shadow and gradients
2. Position and z-index controls
3. Transform controls
4. Typography expansion

### Week 9-10: Rich Text & Responsive (Phase 7-8)
1. TipTap integration for Text component
2. Monaco editor for HTMLBlock
3. Per-breakpoint styling system

### Week 11-12: Templates (Phase 10)
1. Header/Footer templates
2. Save as template feature
3. Template library

### Week 13+: Advanced Features (Phases 9, 11-15)
Continue with advanced components, dynamic data, renderer, and production setup.

---

## Technical Notes

### Dependencies to Add
```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@monaco-editor/react": "^4.x",
  "sonner": "^1.x",
  "mitt": "^3.x",
  "cmdk": "^0.2.x"
}
```

### Shadcn Components to Add
- context-menu, command, sheet, skeleton, switch, toggle, toast, alert-dialog, scroll-area, separator, collapsible

### Code Debt to Address
1. Remove `window.__builderSave` hack
2. Move API types to `packages/types`
3. Add React error boundaries to builder
4. Consistent loading states across pages

---

### Further Considerations

1. **Component Structure Decision:** Should Section/Row/Column be separate components or modes of Container? Recommendation: Separate for clearer semantics and Bricks familiarity.

2. **State Storage:** Per-breakpoint styles need a props restructure. Current: `{ padding: "16px" }`. New: `{ padding: { base: "16px", tablet: "12px", mobile: "8px" } }`. This is a breaking change - implement before too many pages are created.

3. **Template Variables vs Dynamic Data:** These overlap. Consider unifying into a single "Dynamic Content" system with sources: Variables (template), Fields (page), Settings (site), User (auth).