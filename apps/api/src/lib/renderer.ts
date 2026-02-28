// PagePress v0.0.17 - 2026-02-28
// JSON-to-HTML Renderer — converts Craft.js serialized JSON to HTML

import sanitizeHtml from 'sanitize-html';
import {
  generateElementCSS,
  legacyPropsToInlineStyle,
  type AdvancedStyling,
} from './style-generator.js';

// ─── Types ─────────────────────────────────────────────────────────────

interface CraftNode {
  type: { resolvedName: string };
  props: Record<string, unknown>;
  nodes?: string[];
  linkedNodes?: Record<string, string>;
  isCanvas?: boolean;
  displayName?: string;
  custom?: Record<string, unknown>;
  hidden?: boolean;
  parent?: string;
}

type CraftJSON = Record<string, CraftNode>;

interface RenderResult {
  html: string;
  css: string;
}

interface ElementMetadata {
  customName?: string;
  elementId: string;
  appliedClasses?: string[];
  customAttributes?: Array<{ name: string; value: string }>;
  customCSS?: string;
}

// ─── Sanitization Config ───────────────────────────────────────────────

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'video', 'source', 'iframe', 'svg', 'path', 'circle', 'rect',
    'line', 'polyline', 'polygon', 'g', 'defs', 'use', 'symbol',
    'span', 'div', 'section', 'article', 'aside', 'nav', 'header', 'footer', 'main',
    'figure', 'figcaption', 'details', 'summary', 'mark', 'time',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class', 'id', 'style', 'data-*', 'role', 'aria-*', 'loading', 'decoding'],
    img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
    video: ['src', 'poster', 'autoplay', 'muted', 'loop', 'playsinline', 'controls'],
    source: ['src', 'type'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'title'],
    a: ['href', 'target', 'rel'],
    svg: ['xmlns', 'viewBox', 'width', 'height', 'fill', 'stroke', 'stroke-width'],
    path: ['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com', 'vimeo.com'],
};

// ─── Escape Helpers ────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ─── Component Renderers ───────────────────────────────────────────────

function renderContainer(props: Record<string, unknown>, children: string, elementId: string): string {
  const tag = (props.htmlTag as string) || 'div';
  const attrs = buildAttributes(props, elementId);
  return `<${tag}${attrs}>${children}</${tag}>`;
}

function renderDiv(props: Record<string, unknown>, children: string, elementId: string): string {
  const tag = (props.htmlTag as string) || 'div';
  const attrs = buildAttributes(props, elementId);
  return `<${tag}${attrs}>${children}</${tag}>`;
}

function renderSection(props: Record<string, unknown>, children: string, elementId: string): string {
  const attrs = buildAttributes(props, elementId);
  return `<section${attrs}>${children}</section>`;
}

function renderRow(props: Record<string, unknown>, children: string, elementId: string): string {
  const attrs = buildAttributes(props, elementId);
  return `<div${attrs}>${children}</div>`;
}

function renderColumn(props: Record<string, unknown>, children: string, elementId: string): string {
  const attrs = buildAttributes(props, elementId);
  return `<div${attrs}>${children}</div>`;
}

function renderText(props: Record<string, unknown>, elementId: string): string {
  const htmlContent = props.htmlContent as string | undefined;
  const text = props.text as string | undefined;
  const attrs = buildAttributes(props, elementId);

  // Prefer rich text HTML content, sanitize it
  const content = htmlContent
    ? sanitizeHtml(htmlContent, SANITIZE_OPTIONS)
    : `<p>${escapeHtml(text || '')}</p>`;

  return `<div${attrs}>${content}</div>`;
}

function renderHeading(props: Record<string, unknown>, elementId: string): string {
  const level = (props.level as number) || 2;
  const htmlContent = props.htmlContent as string | undefined;
  const text = props.text as string | undefined;
  const linkUrl = props.linkUrl as string | undefined;
  const linkTarget = (props.linkTarget as string) || '_self';
  const tag = `h${Math.max(1, Math.min(6, level))}`;
  const attrs = buildAttributes(props, elementId);

  const content = htmlContent
    ? sanitizeHtml(htmlContent, SANITIZE_OPTIONS)
    : escapeHtml(text || 'Heading');

  if (linkUrl) {
    return `<${tag}${attrs}><a href="${escapeAttr(linkUrl)}" target="${escapeAttr(linkTarget)}"${linkTarget === '_blank' ? ' rel="noopener noreferrer"' : ''}>${content}</a></${tag}>`;
  }

  return `<${tag}${attrs}>${content}</${tag}>`;
}

function renderImage(props: Record<string, unknown>, elementId: string): string {
  const src = props.src as string | undefined;
  const alt = props.alt as string | undefined;
  const attrs = buildAttributes(props, elementId);

  if (!src) {
    return `<div${attrs}><span style="display:flex;align-items:center;justify-content:center;min-height:100px;color:#94a3b8;">No image set</span></div>`;
  }

  return `<img${attrs} src="${escapeAttr(src)}" alt="${escapeAttr(alt || '')}" loading="lazy" decoding="async" />`;
}

function renderButton(props: Record<string, unknown>, elementId: string): string {
  const text = (props.text as string) || 'Button';
  const href = props.href as string | undefined;
  const target = (props.target as string) || '_self';
  const iconBefore = props.iconBefore as string | undefined;
  const iconAfter = props.iconAfter as string | undefined;
  const attrs = buildAttributes(props, elementId);

  let content = escapeHtml(text);
  if (iconBefore) content = `<span class="pp-btn-icon pp-btn-icon-before">${escapeHtml(iconBefore)}</span>${content}`;
  if (iconAfter) content = `${content}<span class="pp-btn-icon pp-btn-icon-after">${escapeHtml(iconAfter)}</span>`;

  if (href) {
    return `<a${attrs} href="${escapeAttr(href)}" target="${escapeAttr(target)}"${target === '_blank' ? ' rel="noopener noreferrer"' : ''}>${content}</a>`;
  }

  return `<button${attrs} type="button">${content}</button>`;
}

function renderLink(props: Record<string, unknown>, elementId: string): string {
  const text = (props.text as string) || 'Link';
  const href = (props.href as string) || '#';
  const target = (props.target as string) || '_self';
  const attrs = buildAttributes(props, elementId);

  return `<a${attrs} href="${escapeAttr(href)}" target="${escapeAttr(target)}"${target === '_blank' ? ' rel="noopener noreferrer"' : ''}>${escapeHtml(text)}</a>`;
}

function renderDivider(props: Record<string, unknown>, elementId: string): string {
  const attrs = buildAttributes(props, elementId);
  return `<hr${attrs} />`;
}

function renderSpacer(props: Record<string, unknown>, elementId: string): string {
  const attrs = buildAttributes(props, elementId);
  return `<div${attrs} aria-hidden="true"></div>`;
}

function renderIcon(props: Record<string, unknown>, elementId: string): string {
  const name = (props.name as string) || 'star';
  const size = (props.size as number) || 24;
  const color = (props.color as string) || 'currentColor';
  const attrs = buildAttributes(props, elementId);

  // Render a simple SVG placeholder with the icon name as accessible text
  return `<span${attrs} role="img" aria-label="${escapeAttr(name)}" style="display:inline-flex;width:${size}px;height:${size}px;color:${escapeAttr(color)}">
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
  </span>`;
}

function renderIconBox(props: Record<string, unknown>, children: string, elementId: string): string {
  const attrs = buildAttributes(props, elementId);
  const iconName = (props.iconName as string) || 'star';
  const iconSize = (props.iconSize as number) || 32;
  const iconColor = (props.iconColor as string) || 'currentColor';
  const heading = (props.heading as string) || '';
  const description = (props.description as string) || '';

  return `<div${attrs}>
    <span role="img" aria-label="${escapeAttr(iconName)}" style="display:inline-flex;width:${iconSize}px;height:${iconSize}px;color:${escapeAttr(iconColor)}">
      <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
    </span>
    ${heading ? `<h3>${escapeHtml(heading)}</h3>` : ''}
    ${description ? `<p>${escapeHtml(description)}</p>` : ''}
    ${children}
  </div>`;
}

function renderVideo(props: Record<string, unknown>, elementId: string): string {
  const src = props.src as string | undefined;
  const videoType = (props.videoType as string) || 'url';
  const poster = props.posterImage as string | undefined;
  const autoplay = props.autoplay as boolean | undefined;
  const loop = props.loop as boolean | undefined;
  const muted = props.muted as boolean | undefined;
  const controls = props.controls !== false;
  const attrs = buildAttributes(props, elementId);

  if (!src) {
    return `<div${attrs}><span style="display:flex;align-items:center;justify-content:center;min-height:200px;color:#94a3b8;">No video set</span></div>`;
  }

  // YouTube embed
  if (videoType === 'youtube' || src.includes('youtube.com') || src.includes('youtu.be')) {
    const videoId = extractYouTubeId(src);
    if (videoId) {
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (loop) params.set('loop', '1');
      if (muted) params.set('mute', '1');
      const paramStr = params.toString() ? `?${params.toString()}` : '';
      return `<div${attrs}><iframe src="https://www.youtube.com/embed/${escapeAttr(videoId)}${paramStr}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" loading="lazy" style="width:100%;aspect-ratio:16/9;" title="Video"></iframe></div>`;
    }
  }

  // Vimeo embed
  if (videoType === 'vimeo' || src.includes('vimeo.com')) {
    const vimeoId = extractVimeoId(src);
    if (vimeoId) {
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (loop) params.set('loop', '1');
      if (muted) params.set('muted', '1');
      const paramStr = params.toString() ? `?${params.toString()}` : '';
      return `<div${attrs}><iframe src="https://player.vimeo.com/video/${escapeAttr(vimeoId)}${paramStr}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" loading="lazy" style="width:100%;aspect-ratio:16/9;" title="Video"></iframe></div>`;
    }
  }

  // Direct video
  const videoAttrs: string[] = [];
  if (controls) videoAttrs.push('controls');
  if (autoplay) videoAttrs.push('autoplay');
  if (loop) videoAttrs.push('loop');
  if (muted) videoAttrs.push('muted');
  videoAttrs.push('playsinline');
  if (poster) videoAttrs.push(`poster="${escapeAttr(poster)}"`);

  return `<div${attrs}><video ${videoAttrs.join(' ')} style="width:100%;"><source src="${escapeAttr(src)}" />Your browser does not support video.</video></div>`;
}

function renderHTMLBlock(props: Record<string, unknown>, elementId: string): string {
  const html = props.html as string | undefined;
  const css = props.css as string | undefined;
  const attrs = buildAttributes(props, elementId);

  let content = '';
  if (css) {
    content += `<style>${sanitizeCSSContent(css)}</style>`;
  }
  if (html) {
    content += sanitizeHtml(html, {
      ...SANITIZE_OPTIONS,
      allowedTags: false, // Allow all tags for HTML blocks
      allowedAttributes: false,
    });
  }

  return `<div${attrs}>${content}</div>`;
}

function renderList(props: Record<string, unknown>, elementId: string): string {
  const listType = (props.listType as string) || 'ul';
  const items = (props.items as string[]) || ['Item 1', 'Item 2', 'Item 3'];
  const attrs = buildAttributes(props, elementId);
  const tag = listType === 'ol' ? 'ol' : 'ul';

  const itemsHtml = items.map((item: string) => `<li>${escapeHtml(item)}</li>`).join('');

  return `<${tag}${attrs}>${itemsHtml}</${tag}>`;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] || null;
}

/**
 * Sanitize CSS content — strip dangerous patterns
 */
function sanitizeCSSContent(css: string): string {
  // Remove JavaScript expressions
  return css
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/url\s*\(\s*["']?\s*javascript/gi, '')
    .replace(/@import/gi, '');
}

/**
 * Build HTML attributes string for an element
 */
function buildAttributes(props: Record<string, unknown>, elementId: string): string {
  const parts: string[] = [];

  if (elementId) {
    parts.push(`id="${escapeAttr(elementId)}"`);
  }

  // Custom attributes from metadata
  const metadata = props.metadata as ElementMetadata | undefined;
  if (metadata?.customAttributes) {
    for (const attr of metadata.customAttributes) {
      if (attr.name && !attr.name.startsWith('on') && attr.name !== 'id') {
        parts.push(`${escapeAttr(attr.name)}="${escapeAttr(attr.value)}"`);
      }
    }
  }

  return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

// ─── Main Renderer ─────────────────────────────────────────────────────

/**
 * Render a single node to HTML
 */
function renderNode(
  nodeId: string,
  json: CraftJSON,
  cssRules: string[],
): string {
  const node = json[nodeId];
  if (!node) return '';

  const componentType = node.type?.resolvedName;
  if (!componentType) return '';

  const props = node.props || {};

  // Check visibility conditions — skip hidden elements
  if (node.hidden) return '';

  // Get element ID from metadata (or generate from node id)
  const metadata = props.metadata as ElementMetadata | undefined;
  const elementId = metadata?.elementId || `pp-${nodeId.replace(/[^a-zA-Z0-9-_]/g, '')}`;

  // Generate CSS for this element
  const advancedStyling = props.advancedStyling as Partial<AdvancedStyling> | undefined;
  const pseudoStateStyling = props.pseudoStateStyling as Record<string, Partial<AdvancedStyling>> | undefined;
  const breakpointStyling = props.breakpointStyling as Record<string, unknown> | undefined;
  const customCSS = metadata?.customCSS;

  const hasAdvancedStyling = advancedStyling && Object.keys(advancedStyling).length > 0;

  if (hasAdvancedStyling || pseudoStateStyling || breakpointStyling || customCSS) {
    const elementCSS = generateElementCSS(
      elementId,
      advancedStyling,
      pseudoStateStyling,
      breakpointStyling as Record<string, Partial<AdvancedStyling> & { pseudoStates?: Record<string, Partial<AdvancedStyling>> }>,
      customCSS,
    );
    if (elementCSS) cssRules.push(elementCSS);
  }

  // If no advanced styling, generate inline legacy CSS as a style rule
  if (!hasAdvancedStyling) {
    const legacyStyle = legacyPropsToInlineStyle(props, componentType);
    if (legacyStyle) {
      cssRules.push(`#${elementId} {\n  ${legacyStyle.split('; ').join(';\n  ')};\n}`);
    }
  }

  // Render child nodes recursively
  const childIds = node.nodes || [];
  const childrenHtml = childIds
    .map((childId: string) => renderNode(childId, json, cssRules))
    .join('');

  // Also render linked nodes (e.g., Column slots)
  const linkedNodeIds = node.linkedNodes || {};
  const linkedHtml = Object.values(linkedNodeIds)
    .map((linkedId: string) => renderNode(linkedId, json, cssRules))
    .join('');

  const allChildren = childrenHtml + linkedHtml;

  // Dispatch to component-specific renderer
  switch (componentType) {
    case 'Container':
      return renderContainer(props, allChildren, elementId);
    case 'Div':
      return renderDiv(props, allChildren, elementId);
    case 'Section':
      return renderSection(props, allChildren, elementId);
    case 'Row':
      return renderRow(props, allChildren, elementId);
    case 'Column':
      return renderColumn(props, allChildren, elementId);
    case 'Text':
      return renderText(props, elementId);
    case 'Heading':
      return renderHeading(props, elementId);
    case 'Image':
      return renderImage(props, elementId);
    case 'Button':
      return renderButton(props, elementId);
    case 'Link':
      return renderLink(props, elementId);
    case 'Divider':
      return renderDivider(props, elementId);
    case 'Spacer':
      return renderSpacer(props, elementId);
    case 'Icon':
      return renderIcon(props, elementId);
    case 'IconBox':
      return renderIconBox(props, allChildren, elementId);
    case 'Video':
      return renderVideo(props, elementId);
    case 'HTMLBlock':
      return renderHTMLBlock(props, elementId);
    case 'List':
      return renderList(props, elementId);
    default:
      // Unknown component — render children in a div
      return allChildren ? `<div${buildAttributes(props, elementId)}>${allChildren}</div>` : '';
  }
}

/**
 * Render Craft.js JSON content to HTML + CSS
 */
export function renderContentJSON(contentJson: Record<string, unknown> | null): RenderResult {
  if (!contentJson || Object.keys(contentJson).length === 0) {
    return { html: '', css: '' };
  }

  const json = contentJson as unknown as CraftJSON;
  const rootNode = json['ROOT'];
  if (!rootNode) {
    return { html: '', css: '' };
  }

  const cssRules: string[] = [];

  // Render starting from ROOT's children
  const childIds = rootNode.nodes || [];
  const html = childIds
    .map((childId: string) => renderNode(childId, json, cssRules))
    .join('');

  return {
    html,
    css: cssRules.join('\n\n'),
  };
}

/**
 * Build a full HTML document for a page
 */
export function buildFullPage(options: {
  title: string;
  bodyHtml: string;
  css: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  faviconUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  customBodyClass?: string;
  customHeadCode?: string;
  customFooterCode?: string;
  pageCustomCSS?: string;
  pageCustomJsHead?: string;
  pageCustomJsBody?: string;
  headerHtml?: string;
  headerCss?: string;
  footerHtml?: string;
  footerCss?: string;
}): string {
  const {
    title,
    bodyHtml,
    css,
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    faviconUrl,
    noIndex,
    noFollow,
    customBodyClass,
    customHeadCode,
    customFooterCode,
    pageCustomCSS,
    pageCustomJsHead,
    pageCustomJsBody,
    headerHtml,
    headerCss,
    footerHtml,
    footerCss,
  } = options;

  const pageTitle = escapeHtml(metaTitle || title);

  // Collect all CSS
  const allCSS = [
    BASE_CSS,
    css,
    headerCss || '',
    footerCss || '',
    pageCustomCSS || '',
  ].filter(Boolean).join('\n\n');

  // Meta tags
  const metaTags: string[] = [];
  metaTags.push(`<meta charset="UTF-8" />`);
  metaTags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`);
  metaTags.push(`<title>${pageTitle}</title>`);

  if (metaDescription) {
    metaTags.push(`<meta name="description" content="${escapeAttr(metaDescription)}" />`);
  }
  if (canonicalUrl) {
    metaTags.push(`<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`);
  }
  if (faviconUrl) {
    metaTags.push(`<link rel="icon" href="${escapeAttr(faviconUrl)}" />`);
  }

  // Open Graph tags
  if (ogTitle || metaTitle || title) {
    metaTags.push(`<meta property="og:title" content="${escapeAttr(ogTitle || metaTitle || title)}" />`);
  }
  if (ogDescription || metaDescription) {
    metaTags.push(`<meta property="og:description" content="${escapeAttr(ogDescription || metaDescription || '')}" />`);
  }
  if (ogImage) {
    metaTags.push(`<meta property="og:image" content="${escapeAttr(ogImage)}" />`);
  }
  if (canonicalUrl) {
    metaTags.push(`<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`);
  }
  metaTags.push(`<meta property="og:type" content="website" />`);

  // Robots directives
  const robotsDirectives: string[] = [];
  if (noIndex) robotsDirectives.push('noindex');
  if (noFollow) robotsDirectives.push('nofollow');
  if (robotsDirectives.length > 0) {
    metaTags.push(`<meta name="robots" content="${robotsDirectives.join(', ')}" />`);
  }

  // Twitter card
  metaTags.push(`<meta name="twitter:card" content="summary_large_image" />`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${metaTags.join('\n  ')}
  <style>${allCSS}</style>
  ${customHeadCode ? sanitizeHtml(customHeadCode, { allowedTags: ['script', 'link', 'style', 'meta', 'noscript'], allowedAttributes: false }) : ''}
  ${pageCustomJsHead ? `<script>${sanitizeCSSContent(pageCustomJsHead)}</script>` : ''}
</head>
<body${customBodyClass ? ` class="${escapeAttr(customBodyClass)}"` : ''}>
  ${headerHtml || ''}
  <main>${bodyHtml}</main>
  ${footerHtml || ''}
  ${customFooterCode ? sanitizeHtml(customFooterCode, { allowedTags: ['script', 'noscript', 'div'], allowedAttributes: false }) : ''}
  ${pageCustomJsBody ? `<script>${sanitizeCSSContent(pageCustomJsBody)}</script>` : ''}
</body>
</html>`;
}

/**
 * Base CSS reset for rendered pages
 */
const BASE_CSS = `
/* PagePress Base Styles */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; tab-size: 4; font-feature-settings: normal; }
body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a; }
img, video { max-width: 100%; height: auto; display: block; }
a { color: inherit; }
h1, h2, h3, h4, h5, h6 { line-height: 1.2; }
ul, ol { list-style-position: inside; }
hr { border: none; }
.pp-btn-icon { display: inline-flex; align-items: center; }
.pp-btn-icon-before { margin-right: 0.5em; }
.pp-btn-icon-after { margin-left: 0.5em; }
`;

/**
 * Build a simple 404 page
 */
export function build404Page(options: {
  siteTitle?: string;
  faviconUrl?: string;
  customHtml?: string;
  customCss?: string;
  headerHtml?: string;
  headerCss?: string;
  footerHtml?: string;
  footerCss?: string;
}): string {
  const {
    siteTitle = 'Page Not Found',
    faviconUrl,
    customHtml,
    customCss,
    headerHtml,
    headerCss,
    footerHtml,
    footerCss,
  } = options;

  const bodyContent = customHtml || `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:2rem;">
      <h1 style="font-size:4rem;font-weight:800;color:#1e293b;">404</h1>
      <p style="font-size:1.25rem;color:#64748b;margin-top:1rem;">The page you're looking for doesn't exist.</p>
      <a href="/" style="margin-top:2rem;padding:0.75rem 1.5rem;background:#3b82f6;color:#fff;border-radius:0.375rem;text-decoration:none;font-weight:500;">Go Home</a>
    </div>`;

  const allCSS = [BASE_CSS, customCss || '', headerCss || '', footerCss || ''].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 - ${escapeHtml(siteTitle)}</title>
  ${faviconUrl ? `<link rel="icon" href="${escapeAttr(faviconUrl)}" />` : ''}
  <meta name="robots" content="noindex, nofollow" />
  <style>${allCSS}</style>
</head>
<body>
  ${headerHtml || ''}
  <main>${bodyContent}</main>
  ${footerHtml || ''}
</body>
</html>`;
}
