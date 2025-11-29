# PagePress

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-React_Vite_Fastify_Drizzle-green.svg)
![Status](https://img.shields.io/badge/status-Alpha_Development-orange.svg)

**PagePress** is a high-performance, self-hosted static site builder designed for the modern web. It combines the visual ease of tools like Oxygen/Bricks with the raw performance and security of a Headless Node.js architecture.

Built for developers who want a **WordPress-like editing experience** without the bloat, relying on a modern stack: **TypeScript, Vite, and SQLite**.

---

## 🚀 Features

- **⚡ Blazing Fast:** Built on **Fastify** (Backend) and **Vite** (Frontend).
- **🎨 Visual Editor:** Drag-and-drop page building powered by **Craft.js**.
- **🔒 Secure by Design:** Full strict TypeScript, **Zod** validation, and **Better-Auth** security.
- **🧱 Headless Architecture:** The CMS (Admin) is decoupled from the Renderer (Public Site).
- **💾 Lightweight DB:** Uses **Drizzle ORM** with **SQLite** for instant setup and portability.
- **🐳 Docker Ready:** Multi-stage builds for easy deployment on any VPS.
- **🛠 Extensible:** "Plugin-first" architecture for custom components and logic.

---

## 🛠️ The Tech Stack

We use the "Modern Performance Stack":

| Domain | Technology | Why? |
| :--- | :--- | :--- |
| **Monorepo** | **pnpm Workspaces** | Efficient dependency management. |
| **Backend** | **Fastify** + Node.js | significantly faster than Express. |
| **Database** | **SQLite** + **Drizzle ORM** | Zero-dependency, type-safe SQL. |
| **Frontend** | **React** + **Vite** | Industry standard SPA framework. |
| **Styling** | **Tailwind CSS** + **Shadcn/UI** | Utility-first styling with accessible components. |
| **Builder** | **Craft.js** | The core engine for the visual editor. |
| **Validation** | **Zod** | Runtime schema validation. |

---

## 📂 Project Structure

PagePress uses a Monorepo structure to share types and logic.

```text
/pagepress
├── /apps
│   ├── /api            # Fastify Backend (Port 3000)
│   └── /admin          # React Admin Panel & Builder (Port 5173)
├── /packages
│   ├── /types          # Shared TypeScript Interfaces & Zod Schemas
│   └── /db             # Shared Database Configuration
├── docker-compose.yml  # Production Orchestration
└── pnpm-workspace.yaml # Workspace Config
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v18+ LTS)
- **pnpm** (`npm install -g pnpm`)
- **Docker** (Optional, for production)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pagepress.git
   cd pagepress
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start Development Server:**
   This command starts both the Backend API and the Frontend Admin panel concurrently.
   ```bash
   pnpm dev
   ```

4. **Access the App:**
   - **Admin/Builder:** [http://localhost:5173](http://localhost:5173)
   - **API:** [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

For production (e.g., Ubuntu Server), use the included Docker setup.

1. **Build and Run:**
   ```bash
   docker-compose up -d --build
   ```

2. **Persistence:**
   - Database is saved to `./data`
   - Uploads are saved to `./uploads`

---

## 🗺️ Roadmap

- [ ] **Phase 1:** Core Infrastructure (Fastify/Vite Setup)
- [ ] **Phase 2:** Authentication (Login, Roles, Security)
- [ ] **Phase 3:** Dashboard (Page Management, Media Library)
- [ ] **Phase 4:** **The Builder** (Canvas, Drag-n-Drop, Properties Panel)
- [ ] **Phase 5:** Public Renderer (Generating the static sites)
- [ ] **Phase 6:** Plugin System & Templates

---

## 🤝 Contributing

1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

**PagePress** — *Build Faster. Load Faster.*
