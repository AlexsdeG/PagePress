# Master Project Plan: "PagePress" Web Site Builder

> **Version:** 0.2.0 (Bricks-Inspired Update)  
> **Last Updated:** 2025-12-05  
> **Status:** ✅ Done | 🔄 Partial | 🐛 Has Bugs | ❌ Not Started

---

## Research (5h)
**Status:** ✅ Complete

---

## Phase 1 (1h): Foundation & Infrastructure
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

## Phase 2 (1.5h): Authentication & Security
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

## Phase 3 (2h): Dashboard & CMS Logic
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

---

## Phase 4A (4h): Builder Critical Fixes
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

## Phase 4B (1h): Builder Core UX (Bricks-Inspired)
**Goal:** Visual feedback and interaction polish.
**Status:** ✅ Complete

### Element Visual States (HIGH PRIORITY)
- [x] **Hover Outline:** Light dashed border on element hover
- [x] **Selection Highlight:** Solid border with corner handles on selected
- [x] **Parent Highlight:** Subtle outline on parent when child selected
- [x] **Debug/Wireframe Mode:** Toggle to show all container boundaries
- [x] **Spacing Visualizer:** Color-coded margin (orange) / padding (green)

### Drag & Drop Feedback
- [x] **Drop Zones:** Blue highlighted areas when dragging
- [x] **Drop Indicators:** Line showing insertion point
- [x] **Drag Ghost:** Semi-transparent preview of dragged element
- [x] **Auto-scroll:** Scroll canvas when dragging near edges
- [x] **Cannot Drop:** Red indicator for invalid drop targets

### Selection & Navigation
- [x] **Breadcrumb Bar:** Show hierarchy (Section > Container > Heading), click to select parent
- [x] **Floating Toolbar:** Quick actions on selected element (duplicate, delete, move up/down)
- [x] **Right-click Context Menu:** Copy, Paste, Duplicate, Delete, Move, Wrap in Container
- [x] **Arrow Key Navigation:** Navigate between siblings with arrow keys

### Left Sidebar Improvements
- [x] **Component Grid:** 2-column grid with icons (like Bricks)
- [x] **Component Categories:** Collapsible: Layout, Basic, General, Media
- [x] **Search Filter:** Filter components by name
- [x] **Component Tooltips:** Show description on hover

### Right Sidebar Improvements
- [x] **Structure Panel:** Styled tree view with icons per component type
- [x] **Drag Reorder:** Reorder elements via drag in structure panel
- [x] **Quick Actions:** Rename, hide, delete, duplicate buttons
- [x] **Collapse/Expand:** Collapse container children in tree

---

## Phase 5 (1.5h): Component Expansion
**Goal:** Essential Bricks-like components.
**Status:** ❌ Not Started

### Layout Components
- [x] **Section:** Full-width wrapper with semantic `<section>` tag
    - Content width control (boxed/full)
    - Vertical alignment
    - Min-height (vh/px)
- [x] **Row:** Horizontal flex container for columns
- [x] **Column:** Flex item with responsive width controls
    - Width: auto, %, px, fr (for grid)
    - Order control
- [x] **Div:** Generic wrapper with custom HTML tag selector

### Basic Components
- [x] **Divider:** Horizontal line with style, width, color
- [x] **Spacer:** Invisible height block (px/vh)
- [x] **Icon:** Lucide icon picker with size, color
- [x] **Icon Box:** Icon + heading + text combo
- [x] **Link/Text Link:** Styled anchor with hover states
- [x] **List:** UL/OL with bullet/number style options

### Media Components
- [x] **Video:** YouTube, Vimeo, MP4 with poster image
- [ ] **Video Popup:** Lightbox video on button click
- [x] **Video:**: in edit mode have extra layer ontop to be able to righclick with custom context menu and left click also opens element options. currently it only shows right click youtube context menu and left click starts the video but i cant access the edit element settings

### Update Existing Components
- [x] **Container:** Add HTML tag selector (div, section, article, aside, nav, header, footer)
- [x] **Heading:** Add link option
- [x] **Button:** Add icon before/after text

---

## Phase 6 (1h): Advanced Styling System
**Goal:** Bricks-level style controls.
**Status:** ✅ Complete

### General
- [x] edit name of element in settings and in strucutre, edit name of the element, still eg a div but you can name it eg HeaderDiv
- [x] better input with eg autocompelte or just input, so you can always also add a own value eg height or margin and more. always use int float string input or select but eg for height or so always number input + with the unit select eg px, vh and more ...
- [x] show readonly id for element, readonly id, ids are on all pages, tempaltes, components unique and never ever have two elements the same id
- [x] add classes you can create from the settings you set in the settings, create new classes, add other classes to the element, here also show eg fro the     settings with blue dots if they are from a class the setting or manualy overwritten for this element. here add at top a list where you can add classes to it, create new ones or use already created ones names to add them to the element
- [x] also add a new sidemenu in settings in edit element. here add icon sidebar for eg backgorund, layout, style, general and more. here implement like bricks for each setting its own tab with all settings in it. update all components to use the new settings components
- [x] full impl of pseudo states like hover active and more to have a full bricks builder experience
 
### Layout Settings (Add to all components)
- [x] **Position:** Static, Relative, Absolute, Fixed, Sticky
- [x] **Z-index:** Numeric input with presets
- [x] **Overflow:** Visible, Hidden, Scroll, Auto
- [x] **Display:** Block, Flex, Grid, Inline, None

### Background Settings
- [x] **Gradient:** Linear/Radial with angle, stops
- [x] **Background Image:** Media picker, size, position, repeat
- [x] **Background Video:** MP4 with poster fallback
- [x] **Overlay:** Color overlay with opacity

### Border & Effects
- [x] **Box Shadow:** Multiple shadows with inset option
- [x] **Text Shadow:** X, Y, Blur, Color
- [x] **Filters:** Blur, Brightness, Contrast, Grayscale, Saturate
- [x] **Backdrop Filter:** Blur, Brightness for glass effects

### Transform & Transitions
- [x] **Transform:** Translate, Rotate, Scale, Skew (with units)
- [x] **Transform Origin:** 9-point selector
- [x] **Transition:** Property, Duration, Easing, Delay

### Typography Expansion
- [x] **Font Family:** Google Fonts picker or custom stack
- [x] **Text Transform:** Uppercase, Lowercase, Capitalize
- [x] **Text Decoration:** Underline, Overline, Line-through
- [x] **Word/Letter Spacing:** Fine-tune controls

### Fully Functional 
- [x] **Apply Set Settings:** All settings fully read/write to element styles, using style or tailwind classes

---

## Phase 7 (1.5h): Responsive Design System
**Goal:** Per-breakpoint styling like Bricks.
**Status:** 🔄 Partial

### Breakpoint Architecture
- [x] **Store styles per breakpoint:** Desktop (base), Tablet (<992px), Mobile (<768px), Mobile Portrait (<479px)
- [x] **Visual Indicator:** yellow dot right side inputs/slider/textarea/others showing if value differs from desktop
- [x] **Inheritance:** Values cascade down from larger breakpoints
- [x] **Reset to Desktop:** Button to remove breakpoint-specific value (in general setting tab)

### Responsive Controls
- [x] **Device breakpoint toggle:** Toolbar buttons to switch between breakpoints
- [x] **Per-property breakpoint toggle:** Click to set mobile-specific value (in general setting tab and in the top tab title bar on the right side same as pseudo state system to allow to change between pseudo states or breakpoints in all of the tabs easily)
- [x] **Hide on breakpoint:** Toggle visibility per device (in general setting tab)
- [x] **Responsive spacing/typogrpahy/settings:** Different padding/margin per breakpoint. Different font sizes per breakpoint. all element settings tabs options should be allowed to differ from breakpoints. system should work similar to pseudo state system

### Preview Enhancements
- [x] **Device Frames:** Visual phone/tablet frame around canvas
- [x] **Orientation Toggle:** Portrait/Landscape for mobile/tablet
- [x] **Accurate Dimensions:** Match real device sizes

### Global Settings in Builder
- [x] **Global Theme Settings Panel:** Colors, typography, elements, breakpoints, spacing
- [x] **Page Settings Panel:** SEO, social sharing, custom code per page
- [x] **Auto-create defaults:** Backend creates default theme on first access

---

## Phase 8: Rich Text & Code Editing
**Goal:** Professional content editing.
**Status:** ✅ Complete

### TipTap Integration (Text Component)
- [x] **Inline Editing:** Double-click text to edit directly on canvas
- [x] **Fixed Toolbar:** Toolbar stays visible above text box (replaced BubbleMenu)
- [x] **Formatting:** Bold, Italic, Underline, Strikethrough
- [x] **Links:** Add/edit/remove links with URL input
- [x] **Lists:** Toggle bullet/numbered lists
- [x] **Text Align:** Left, Center, Right, Justify
- [x] **Headings:** Convert to H1-H6 within text (Text component only)
- [x] **Clear Formatting:** Remove all styles
- [x] **Mouse Control:** Click to position cursor, proper event handling
- [x] **Single Edit Mode:** Only one text/heading in edit mode at a time

### Monaco Editor (HTMLBlock & Custom CSS)
- [x] **Syntax Highlighting:** HTML, CSS, JavaScript with Monaco
- [x] **Tabbed Interface:** HTML/CSS/JS tabs in HTMLBlock settings
- [x] **Lazy Loading:** Monaco loaded on demand

### Custom Attributes (Bricks Feature)
- [x] **Attributes Panel:** Add custom HTML attributes
- [x] **Name/Value Inputs:** e.g., `role="banner"`, `data-section="hero"`
- [x] **ARIA Presets:** Common accessibility roles and states dropdown

### Additional Fixes (v0.0.12)
- [x] **Transition Fix:** Default Tailwind transitions don't override user-set CSS transitions
- [x] **Heading Sizes:** H1-H6 level selector properly updates font size
- [x] **Context Menu:** Canvas shows custom context menu, not browser default
- [x] **Modified Props System:** Track which properties have been explicitly modified
- [x] **Settings Context Menu:** Right-click to reset field to default

---

## Phase 9: Advanced Components - SKIP FOR NOW
**Goal:** Interactive and dynamic components.
**Status:** ❌ Not Started

### Interactive Components
- [ ] **Accordion:** Collapsible panels with open/close animation
- [ ] **Tabs:** Horizontal/vertical tab navigation
- [ ] **Toggle/Switch:** On/off with custom labels
- [ ] **Modal/Popup:** Trigger on click, exit intent, timer
- [ ] **Tooltip:** Hover text with position options
- [ ] **Grid:** A flexible grid container with gap controls

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
**Status:** ✅ Complete

### General
- [x] seperate pages from tempaltes and other, only pages can be dispalyed on the forntend, everything else has to be part or dispalyed on a page. create a seperate admin page called templates which hosts all custom tempaltes

### System Templates
- [x] **Header Template:** Auto-inject at page top
- [x] **Footer Template:** Auto-inject at page bottom
- [x] **404 Template:** Custom not-found page
- [x] **Template Selector:** Assign template per page

### Section Templates (Library)
- [x] **Save as Template:** Save any element/group as reusable
- [x] **Template Library:** Browse and insert saved templates
- [x] **Categories:** Hero, Features, CTA, Contact, etc.
- [x] **Import/Export:** JSON template files
- [ ] **Starter Templates:** Pre-built full-page layouts

### Template Variables (Dynamic)
- [ ] **Variable Syntax:** `{{variable_name}}` in text
- [ ] **Variable Editor:** UI to fill in variables when inserting
- [ ] **Default Values:** Fallback if variable not set
- [ ] **Image Variables:** Dynamic image placeholders

### Global Elements
- [x] **Mark as Global:** Sync changes across all instances
- [x] **Global Indicator:** Visual badge on global elements
- [x] **Unlink:** Convert global to local instance

---

## Phase 11: Dynamic Data & Conditions
**Goal:** Data-driven content like Bricks.
**Status:** ✅ Complete

### Dynamic Data Fields
- [x] **Dynamic Tag Button:** Lightning icon on text/image inputs
- [x] **Data Sources:**
    - Site Title, Description, URL
    - Page Title, Slug, Date, Author
    - Current User Name, Email, Role
    - Custom Fields (future)
- [x] **Fallback Values:** Default if data empty

### Conditional Visibility
- [x] **Conditions Panel:** Show element if...
- [x] **Condition Types:**
    - User logged in / logged out
    - User role equals
    - Page is homepage
    - Device is mobile/tablet/desktop
    - Custom field equals/contains
- [x] **AND/OR Logic:** Multiple conditions

### Query Loop (Future)
- [ ] **Loop Container:** Repeat children for each post
- [ ] **Query Builder:** Post type, category, limit, order
- [ ] **Pagination:** Load more, page numbers

---

## Phase 12: Public Renderer (Frontend)
**Goal:** Display built pages as fast HTML.
**Status:** ✅ Complete (v0.0.17)

### URL Structure
- [x] `/` → Homepage (configurable via `homepageSlug` setting)
- [x] `/:slug` → Dynamic page routing
- [x] `/pp-admin/*` → Admin panel (React SPA with `basename: '/pp-admin'`)
- [x] API at `/pp-admin/api/*` (all admin API routes behind this prefix)

### Render Engine
- [x] **JSON to HTML:** Server-side Craft.js JSON → HTML renderer (`renderer.ts`)
- [x] **Server-Side Style Generator:** AdvancedStyling → CSS conversion (`style-generator.ts`)
- [x] **Inject Templates:** Header/Footer auto-insertion (per-page and system templates)
- [ ] **Static Export (Optional):** Pre-render to HTML files

### SEO & Meta
- [x] **Per-Page SEO:** Title, meta description from pageSettings
- [x] **OG Tags:** Image, title, description for social sharing
- [x] **Canonical URLs:** Auto-generated from siteUrl + slug
- [x] **Robots.txt & Sitemap.xml:** Auto-generation routes

### Performance
- [x] **Critical CSS:** Inline styles in `<style>` tag (no external CSS requests)
- [x] **Lazy Loading:** Images rendered with `loading="lazy" decoding="async"`
- [ ] **Asset Optimization:** Minify CSS/JS (deferred)

---

## Phase 13: Quality of Life
**Goal:** Professional admin experience.
**Status:** ✅ Complete (v0.0.18)

- [x] **Missing in Admin Dashboard:**
    - [x] Users management page
    - [x] Role-based permission display. here create a role editor with list where you can also add roles and set permissions for each role in a modal
    - [x] invite link send to email in user managment page, also invite link but only one time useable
    - [x] first time setup you can create account, after first time setup, var in a created config file or .env file. login page remove create account option. here create good first time setup instructions and steps like revoery phrase, admin email and pw, set website name
    - [x] users dispaly eg who created which pages, tempalte, logs of all actions in db table
    - [x] email and username login, emial code when changing email or for admin first account setup
    - [ ] forgot pw and jwt token login when saved otherwise username/email (here both should work in login) and password
    - [ ] utilize a pp-config.json file for all constants and variables

### User Management
- [x] **Users Page:** List, create, edit, delete users
- [x] **Roles:** Admin (full), Editor (pages only), Viewer (read-only) — full role editor with permission matrix
- [x] **Invite System:** Generate one-time invite links with configurable expiry
- [x] **Profile Page:** Change username, email, password
- [x] **Activity Logs:** Full activity log viewer with filtering
- [x] **Account Lockout:** Auto-lock after failed login attempts, admin unlock
- [x] **First-Time Setup:** Dedicated setup page for initial admin account + site name

### Notifications
- [x] **Toast System:** Sonner already installed (Phase 6)
- [x] **Success/Error/Info toasts** for all actions
- [x] **Confirmation Dialogs:** Delete confirmations
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

### Documenation
- [ ] **Developer Guide:** How to create plugins, components, use hooks
- [ ] **API Reference:** List of available hooks, slots, registration functions
- [ ] **Example Plugins:** Gallery, Contact Form, Custom HTML
- everything in seperate Docs folder Plugins docs

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

### Documentation
- [ ] **Setup:** Setup Docs
- [ ] **Readme:** update readme fully with all features and good introductoin

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