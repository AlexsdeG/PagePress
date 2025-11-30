// PagePress v0.0.4 - 2025-11-30
// Slug generation utilities

import { eq, like } from 'drizzle-orm';
import { db } from './db.js';
import { pages } from './schema.js';

/**
 * Generate a URL-safe slug from a string
 * @param text - Text to convert to slug
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug, appending -1, -2, etc. if necessary
 * @param title - Title to generate slug from
 * @param excludeId - Optional page ID to exclude from uniqueness check (for updates)
 * @returns Unique slug
 */
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(title);
  
  if (!baseSlug) {
    // If title produces empty slug, use a timestamp-based one
    return `page-${Date.now()}`;
  }
  
  // Check if base slug is available
  const existing = await db
    .select({ id: pages.id, slug: pages.slug })
    .from(pages)
    .where(like(pages.slug, `${baseSlug}%`));
  
  // Filter out the page being updated
  const conflicts = existing.filter(p => p.id !== excludeId);
  
  if (conflicts.length === 0) {
    return baseSlug;
  }
  
  // Check if exact match exists
  const exactMatch = conflicts.find(p => p.slug === baseSlug);
  if (!exactMatch) {
    return baseSlug;
  }
  
  // Find the highest number suffix
  let maxNum = 0;
  for (const page of conflicts) {
    const match = page.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  
  return `${baseSlug}-${maxNum + 1}`;
}

/**
 * Validate that a slug is URL-safe
 * @param slug - Slug to validate
 * @returns True if valid
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Check if a slug is unique (not already in use)
 * @param slug - Slug to check
 * @param excludeId - Optional page ID to exclude from check
 * @returns True if unique
 */
export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);
  
  if (existing.length === 0) return true;
  if (excludeId && existing[0] && existing[0].id === excludeId) return true;
  return false;
}
