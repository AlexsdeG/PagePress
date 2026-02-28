// PagePress v0.0.17 - 2026-02-28
// Public Renderer Routes — serves rendered pages to end users

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { pages, siteSettings, pageSettings } from '../lib/schema.js';
import { renderContentJSON, buildFullPage, build404Page } from '../lib/renderer.js';

// ─── Settings Helpers ──────────────────────────────────────────────────

interface SiteSettingsMap {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  faviconUrl: string;
  customHeadCode: string;
  customFooterCode: string;
  homepageSlug: string;
}

async function getSiteSettings(): Promise<SiteSettingsMap> {
  const rows = await db.select().from(siteSettings);
  const map: Record<string, unknown> = {};
  for (const row of rows) {
    // value is JSON mode — could be string, number, object, or null
    map[row.key] = typeof row.value === 'string' ? row.value : row.value != null ? String(row.value) : '';
  }
  return {
    siteTitle: (map.siteTitle as string) || 'My PagePress Site',
    siteDescription: (map.siteDescription as string) || '',
    siteUrl: (map.siteUrl as string) || '',
    faviconUrl: (map.faviconUrl as string) || '',
    customHeadCode: (map.customHeadCode as string) || '',
    customFooterCode: (map.customFooterCode as string) || '',
    homepageSlug: (map.homepageSlug as string) || 'home',
  };
}

// ─── Template Loading ──────────────────────────────────────────────────

interface RenderedTemplate {
  html: string;
  css: string;
}

/**
 * Load and render a system template (header, footer, notfound)
 */
async function loadSystemTemplate(templateType: 'header' | 'footer' | 'notfound'): Promise<RenderedTemplate | null> {
  const result = await db
    .select({
      id: pages.id,
      contentJson: pages.contentJson,
      published: pages.published,
    })
    .from(pages)
    .where(and(eq(pages.type, 'template'), eq(pages.templateType, templateType)))
    .limit(1);

  const template = result[0];
  if (!template || !template.published) return null;

  return renderContentJSON(template.contentJson);
}

/**
 * Load and render a specific template by ID
 */
async function loadTemplateById(templateId: string): Promise<RenderedTemplate | null> {
  const result = await db
    .select({
      id: pages.id,
      contentJson: pages.contentJson,
    })
    .from(pages)
    .where(and(eq(pages.id, templateId), eq(pages.type, 'template')))
    .limit(1);

  const template = result[0];
  if (!template) return null;

  return renderContentJSON(template.contentJson);
}

// ─── Page Settings Loading ─────────────────────────────────────────────

interface PageSEOSettings {
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  customCSS?: string;
  jsHead?: string;
  jsBody?: string;
  disableHeader?: boolean;
  disableFooter?: boolean;
  customBodyClass?: string;
}

async function getPageSettings(pageId: string): Promise<PageSEOSettings> {
  const result = await db
    .select()
    .from(pageSettings)
    .where(eq(pageSettings.pageId, pageId));

  const settings = (result[0]?.settings || {}) as Record<string, unknown>;
  const seo = (settings.seo || {}) as Record<string, unknown>;
  const social = (settings.social || {}) as Record<string, unknown>;
  const customCode = (settings.customCode || {}) as Record<string, unknown>;

  return {
    metaTitle: seo.metaTitle as string | undefined,
    metaDescription: seo.metaDescription as string | undefined,
    noIndex: seo.noIndex as boolean | undefined,
    noFollow: seo.noFollow as boolean | undefined,
    ogTitle: social.ogTitle as string | undefined,
    ogDescription: social.ogDescription as string | undefined,
    ogImage: social.ogImage as string | undefined,
    customCSS: customCode.css as string | undefined,
    jsHead: customCode.jsHead as string | undefined,
    jsBody: customCode.jsBody as string | undefined,
    disableHeader: settings.disableHeader as boolean | undefined,
    disableFooter: settings.disableFooter as boolean | undefined,
    customBodyClass: settings.customBodyClass as string | undefined,
  };
}

// ─── Page Rendering Pipeline ───────────────────────────────────────────

async function renderPage(
  page: {
    id: string;
    title: string;
    slug: string;
    contentJson: Record<string, unknown> | null;
    headerTemplateId: string | null;
    footerTemplateId: string | null;
  },
  siteConfig: SiteSettingsMap,
): Promise<string> {
  // 1. Render the page content
  const { html: bodyHtml, css: bodyCss } = renderContentJSON(page.contentJson);

  // 2. Load page-specific settings (SEO, custom code)
  const pageConfig = await getPageSettings(page.id);

  // 3. Load header template
  let headerResult: RenderedTemplate | null = null;
  if (!pageConfig.disableHeader) {
    if (page.headerTemplateId) {
      headerResult = await loadTemplateById(page.headerTemplateId);
    }
    if (!headerResult) {
      headerResult = await loadSystemTemplate('header');
    }
  }

  // 4. Load footer template
  let footerResult: RenderedTemplate | null = null;
  if (!pageConfig.disableFooter) {
    if (page.footerTemplateId) {
      footerResult = await loadTemplateById(page.footerTemplateId);
    }
    if (!footerResult) {
      footerResult = await loadSystemTemplate('footer');
    }
  }

  // 5. Build canonical URL
  const baseUrl = siteConfig.siteUrl || '';
  const canonicalUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/${page.slug === 'home' ? '' : page.slug}` : undefined;

  // 6. Build full HTML document
  return buildFullPage({
    title: page.title,
    bodyHtml,
    css: bodyCss,
    metaTitle: pageConfig.metaTitle || page.title,
    metaDescription: pageConfig.metaDescription || siteConfig.siteDescription,
    canonicalUrl,
    ogTitle: pageConfig.ogTitle,
    ogDescription: pageConfig.ogDescription || pageConfig.metaDescription || siteConfig.siteDescription,
    ogImage: pageConfig.ogImage,
    faviconUrl: siteConfig.faviconUrl,
    noIndex: pageConfig.noIndex,
    noFollow: pageConfig.noFollow,
    customBodyClass: pageConfig.customBodyClass,
    customHeadCode: siteConfig.customHeadCode,
    customFooterCode: siteConfig.customFooterCode,
    pageCustomCSS: pageConfig.customCSS,
    pageCustomJsHead: pageConfig.jsHead,
    pageCustomJsBody: pageConfig.jsBody,
    headerHtml: headerResult?.html,
    headerCss: headerResult?.css,
    footerHtml: footerResult?.html,
    footerCss: footerResult?.css,
  });
}

/**
 * Render a 404 page with optional custom template
 */
async function render404(siteConfig: SiteSettingsMap): Promise<string> {
  const notfoundTemplate = await loadSystemTemplate('notfound');

  // Load header/footer for 404 too
  const headerResult = await loadSystemTemplate('header');
  const footerResult = await loadSystemTemplate('footer');

  return build404Page({
    siteTitle: siteConfig.siteTitle,
    faviconUrl: siteConfig.faviconUrl,
    customHtml: notfoundTemplate?.html,
    customCss: notfoundTemplate?.css,
    headerHtml: headerResult?.html,
    headerCss: headerResult?.css,
    footerHtml: footerResult?.html,
    footerCss: footerResult?.css,
  });
}

// ─── Route Registration ────────────────────────────────────────────────

export async function publicRendererRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /robots.txt — auto-generated robots.txt
   */
  fastify.get('/robots.txt', async (_request: FastifyRequest, reply: FastifyReply) => {
    const siteConfig = await getSiteSettings();
    const baseUrl = siteConfig.siteUrl ? siteConfig.siteUrl.replace(/\/$/, '') : '';

    const robotsTxt = [
      'User-agent: *',
      'Allow: /',
      '',
      'Disallow: /pp-admin/',
      '',
      baseUrl ? `Sitemap: ${baseUrl}/sitemap.xml` : '',
    ].filter(Boolean).join('\n');

    return reply.type('text/plain').send(robotsTxt);
  });

  /**
   * GET /sitemap.xml — auto-generated sitemap of published pages
   */
  fastify.get('/sitemap.xml', async (_request: FastifyRequest, reply: FastifyReply) => {
    const siteConfig = await getSiteSettings();
    const baseUrl = siteConfig.siteUrl ? siteConfig.siteUrl.replace(/\/$/, '') : '';

    if (!baseUrl) {
      return reply.type('application/xml').send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`
      );
    }

    // Get all published pages (not templates)
    const publishedPages = await db
      .select({
        slug: pages.slug,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .where(and(eq(pages.published, true), eq(pages.type, 'page')));

    const urls = publishedPages.map((page) => {
      const loc = page.slug === siteConfig.homepageSlug
        ? baseUrl
        : `${baseUrl}/${page.slug}`;
      const lastmod = page.updatedAt
        ? new Date(page.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n');

    return reply.type('application/xml').send(xml);
  });

  /**
   * GET / — Homepage (configurable via settings)
   */
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const siteConfig = await getSiteSettings();
    const homepageSlug = siteConfig.homepageSlug || 'home';

    // Find the homepage
    const result = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        contentJson: pages.contentJson,
        headerTemplateId: pages.headerTemplateId,
        footerTemplateId: pages.footerTemplateId,
      })
      .from(pages)
      .where(and(eq(pages.slug, homepageSlug), eq(pages.published, true), eq(pages.type, 'page')))
      .limit(1);

    const page = result[0];
    if (!page) {
      // If no homepage found, try to return a helpful response
      const html = await render404(siteConfig);
      return reply.status(404).type('text/html').send(html);
    }

    const html = await renderPage(page, siteConfig);
    return reply.type('text/html').send(html);
  });

  /**
   * GET /:slug — Dynamic page routing
   */
  fastify.get<{ Params: { slug: string } }>(
    '/:slug',
    async (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
      const { slug } = request.params;

      // Skip reserved paths (handled by other routes/static plugins)
      if (slug === 'uploads' || slug === 'pp-admin') {
        return; // Let other handlers deal with these
      }

      const siteConfig = await getSiteSettings();

      // Find the page by slug
      const result = await db
        .select({
          id: pages.id,
          title: pages.title,
          slug: pages.slug,
          contentJson: pages.contentJson,
          headerTemplateId: pages.headerTemplateId,
          footerTemplateId: pages.footerTemplateId,
        })
        .from(pages)
        .where(and(eq(pages.slug, slug), eq(pages.published, true), eq(pages.type, 'page')))
        .limit(1);

      const page = result[0];
      if (!page) {
        const html = await render404(siteConfig);
        return reply.status(404).type('text/html').send(html);
      }

      const html = await renderPage(page, siteConfig);
      return reply.type('text/html').send(html);
    },
  );
}

// ─── XML Escape Helper ─────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
