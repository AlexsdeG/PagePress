
# Part 1: System Preparation (Linux Mint 22)

First, we need to install the core tools. Open your terminal.

### 1. Install Node.js (via NVM)
*Why NVM? It prevents permission issues and lets you switch versions easily.*

```bash
# Install curl if missing
sudo apt update && sudo apt install curl -y

# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Close and reopen terminal, or run:
source ~/.bashrc

# Install latest Node LTS (Long Term Support)
nvm install --lts
nvm use --lts

# Install pnpm (Better/Faster than npm)
npm install -g pnpm
```

### 2. Install Docker
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  noble stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Add your user to docker group (so you don't need 'sudo' for docker commands)
sudo usermod -aG docker $USER
# LOG OUT AND LOG BACK IN for this to take effect!
```

---

# Part 2: Scaffolding the Codebase

We will create a directory for your project and set up the Monorepo.

```bash
# 1. Create folder
mkdir pagepress-builder
cd pagepress-builder

# 2. Initialize project
pnpm init

# 3. Create workspace file
touch pnpm-workspace.yaml
```

**Edit `pnpm-workspace.yaml`** (using `nano pnpm-workspace.yaml` or Code):
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

# Part 3: Backend Setup (Fastify + TypeScript)

```bash
# 1. Create api folder
mkdir -p apps/api
cd apps/api

# 2. Init package
pnpm init

# 3. Install dependencies
pnpm add fastify @fastify/cors dotenv zod drizzle-orm better-sqlite3
pnpm add -D typescript @types/node @types/better-sqlite3 tsx drizzle-kit

# 4. Initialize TypeScript
npx tsc --init
```

**Create `apps/api/src/index.ts`:**
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';

const server = Fastify({ logger: true });

server.register(cors, { 
  origin: true // Allow dev frontend to connect
});

server.get('/', async (request, reply) => {
  return { status: 'ok', message: 'PagePress API Running' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
```

**Add script to `apps/api/package.json`:**
```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc"
}
```

---

# Part 4: Frontend Setup (Vite + React)

```bash
# Go back to root
cd ../../

# Create Vite project inside apps folder
cd apps
npm create vite@latest admin -- --template react-ts

# Select "React" and "TypeScript" if prompted
cd admin

# Install dependencies
pnpm install
pnpm add tailwindcss postcss autoprefixer lucide-react clsx tailwind-merge
pnpm add -D @types/node

# Initialize Tailwind
npx tailwindcss init -p
```

**Configure `apps/admin/vite.config.ts` (The Proxy):**
*This allows your frontend to talk to backend locally without CORS issues.*

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

---

# Part 5: Running Locally (Development)

This is how you work every day. You don't need Docker for development (it's faster without it).

**In Root `package.json`**, add these scripts to run both at once:

```json
"scripts": {
  "dev:api": "pnpm --filter api dev",
  "dev:admin": "pnpm --filter admin dev",
  "dev": "pnpm --recursive --parallel dev"
}
```

**To Start:**
1. Open terminal in `pagepress-builder`.
2. Run `pnpm dev`.
3. Open Browser:
    *   Frontend: `http://localhost:5173`
    *   Backend: `http://localhost:3000`

---

# Part 6: Docker Setup (For Production/Server)

When you are ready to put this on your Ubuntu Server, use this setup.

### 1. Create `Dockerfile` for API (`apps/api/Dockerfile`)
```dockerfile
FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
# Install turbo or pnpm globally
RUN npm install -g pnpm
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 2. Create `Dockerfile` for Admin (`apps/admin/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter admin build

FROM nginx:alpine
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create Root `docker-compose.yml`
```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data # Save SQLite DB here
    restart: always

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "8080:80"
    depends_on:
      - api
    restart: always
```

---

# Part 7: VS Code Setup

To get the "High Industry Standard" experience, install these VS Code Extensions:

1.  **ESLint** (Code quality)
2.  **Prettier** (Code formatting)
3.  **Tailwind CSS IntelliSense** (Auto-complete for classes)
4.  **Pretty TypeScript Errors** (Makes TS errors readable)
5.  **Docker** (Manage containers easily)
6.  **GitHub Copilot** (For your AI Agent usage)

**Create `.vscode/settings.json`:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

# Summary Check

1.  **Local Dev:** Run `pnpm dev`. Fast, hot-reloading.
2.  **Database:** It will create a `sqlite.db` file in your API folder automatically when we setup Drizzle properly.
3.  **Deployment:** Upload the folder to your Ubuntu Server, run `docker compose up -d --build`.
