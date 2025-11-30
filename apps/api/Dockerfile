# PagePress v0.0.2 - 2025-11-30

# ===== Build Stage =====
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/ ./apps/api/

# Build the application
WORKDIR /app/apps/api
RUN pnpm build

# ===== Production Stage =====
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 pagepress

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create data directory
RUN mkdir -p /app/data /app/uploads && \
    chown -R pagepress:nodejs /app

USER pagepress

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/app/data/pagepress.db

CMD ["node", "dist/index.js"]
