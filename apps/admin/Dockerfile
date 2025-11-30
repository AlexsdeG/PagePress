# PagePress v0.0.2 - 2025-11-30

# ===== Build Stage =====
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/admin/package.json ./apps/admin/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/admin/ ./apps/admin/

# Build the application
WORKDIR /app/apps/admin
RUN pnpm build

# ===== Production Stage =====
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
