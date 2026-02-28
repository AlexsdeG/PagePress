import { defineConfig, type PluginOption } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import http from 'node:http'

/**
 * Vite plugin that proxies public page requests (/, /:slug, /robots.txt, /sitemap.xml)
 * to the API server where the public renderer lives.
 * This allows viewing frontend pages from the Vite dev server during development.
 */
function publicPageProxy(): PluginOption {
  return {
    name: 'pagepress-public-proxy',
    configureServer(server) {
      // Must run BEFORE Vite's built-in middleware (SPA fallback)
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // Let Vite handle: admin routes, HMR, source files, node_modules, uploads, API
        if (
          url.startsWith('/pp-admin') ||
          url.startsWith('/@') ||
          url.startsWith('/src/') ||
          url.startsWith('/node_modules/') ||
          url.startsWith('/uploads/') ||
          url.startsWith('/__') // Vite internal
        ) {
          return next();
        }

        // Let Vite handle static asset requests (dev-time source/build files)
        if (/\.(js|ts|tsx|jsx|css|scss|less|map|json|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|mp4|webm|ogg)(\?.*)?$/.test(url)) {
          return next();
        }

        // Proxy everything else to the API server (public renderer)
        const proxyReq = http.request(
          {
            hostname: 'localhost',
            port: 3000,
            path: url,
            method: req.method,
            headers: { ...req.headers, host: 'localhost:3000' },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
            proxyRes.pipe(res);
          },
        );

        proxyReq.on('error', () => {
          // API server not running — fall through to Vite
          next();
        });

        req.pipe(proxyReq);
      });
    },
  };
}

export default defineConfig({
  plugins: [publicPageProxy(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    name: 'admin',
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}'],
    },
  },
  server: {
    proxy: {
      '/pp-admin/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Forward as-is — backend expects /pp-admin/api/* paths
        cookieDomainRewrite: 'localhost',
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})