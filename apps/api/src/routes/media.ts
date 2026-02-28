// PagePress v0.0.14 - 2026-02-28
// Media upload and management routes — hardened with UUID filenames, path safety, consistent responses

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { db, getUploadsDir } from '../lib/db.js';
import { media } from '../lib/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../lib/env.js';
import { notFound, badRequest } from '../lib/errors.js';

/**
 * Allowed MIME types for uploads
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
]);

/**
 * Allowed extensions (must match MIME types above)
 */
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.pdf', '.mp4', '.webm', '.mp3', '.wav',
]);

/**
 * Maximum file size (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Query parameters schema for listing media
 */
const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  mimeType: z.string().optional(),
});

/**
 * Update media schema
 */
const updateMediaSchema = z.object({
  altText: z.string().max(500).optional(),
});

/**
 * Generate a safe filename with UUID prefix to prevent collisions and path traversal
 */
function generateSafeFilename(originalName: string): string {
  // Extract and validate extension
  const ext = path.extname(originalName).toLowerCase();
  // Use UUID prefix for uniqueness and safety
  return `${randomUUID()}${ext}`;
}

/**
 * Validate that a resolved file path stays within the uploads directory
 */
function ensureSafePath(filename: string, uploadsDir: string): string {
  const resolved = path.resolve(uploadsDir, path.basename(filename));
  if (!resolved.startsWith(path.resolve(uploadsDir))) {
    throw badRequest('Invalid filename');
  }
  return resolved;
}

/**
 * Get the public URL for a media file
 */
function getMediaUrl(filename: string): string {
  const baseUrl = env.NODE_ENV === 'production'
    ? process.env.PUBLIC_URL || ''
    : `http://localhost:${env.PORT}`;
  return `${baseUrl}/uploads/${encodeURIComponent(filename)}`;
}

/**
 * Register media routes
 */
export async function mediaRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /media - List all media with pagination
   */
  fastify.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const { page, limit, mimeType } = querySchema.parse(request.query);
    const offset = (page - 1) * limit;

    // Build query
    let query = db.select().from(media);
    if (mimeType) {
      query = query.where(eq(media.mimeType, mimeType)) as typeof query;
    }

    // Get total count
    const countResult = await db.select({ id: media.id }).from(media);
    const total = countResult.length;

    const result = await query
      .orderBy(desc(media.createdAt))
      .limit(limit)
      .offset(offset);

    return reply.send({
      success: true,
      data: {
        media: result,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  });

  /**
   * GET /media/:id - Get single media item
   */
  fastify.get('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
    const mediaItem = result[0];
    if (!mediaItem) {
      throw notFound('Media not found');
    }

    return reply.send({ success: true, data: { media: mediaItem } });
  });

  /**
   * POST /media - Upload a new file
   */
  fastify.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;
    const data = await request.file();

    if (!data) {
      throw badRequest('No file uploaded');
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(data.mimetype)) {
      throw badRequest(`File type not allowed: ${data.mimetype}`);
    }

    // Validate extension
    const ext = path.extname(data.filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw badRequest(`File extension not allowed: ${ext}`);
    }

    // Generate safe filename and ensure path safety
    const filename = generateSafeFilename(data.filename);
    const uploadsDir = getUploadsDir();
    const filePath = ensureSafePath(filename, uploadsDir);

    // Stream file to disk with size tracking
    let fileSize = 0;
    const writeStream = fs.createWriteStream(filePath);

    try {
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        fileSize += chunk.length;
        if (fileSize > MAX_FILE_SIZE) {
          writeStream.destroy();
          try { fs.unlinkSync(filePath); } catch { /* ignore */ }
          throw badRequest(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        chunks.push(chunk);
      }

      for (const chunk of chunks) {
        writeStream.write(chunk);
      }
      writeStream.end();

      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } catch (error) {
      // Clean up on error (ignore ENOENT if already removed)
      try { fs.unlinkSync(filePath); } catch { /* ignore */ }
      throw error;
    }

    // Create database record
    const mediaId = randomUUID();
    const url = getMediaUrl(filename);
    const now = new Date();

    await db.insert(media).values({
      id: mediaId,
      filename,
      originalName: data.filename,
      url,
      mimeType: data.mimetype,
      size: fileSize,
      altText: null,
      uploadedBy: user.id,
      createdAt: now,
    });

    return reply.status(201).send({
      success: true,
      data: {
        media: {
          id: mediaId, filename, originalName: data.filename,
          url, mimeType: data.mimetype, size: fileSize,
          altText: null, uploadedBy: user.id, createdAt: now,
        },
      },
    });
  });

  /**
   * PUT /media/:id - Update media metadata
   */
  fastify.put('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { altText } = updateMediaSchema.parse(request.body);

    const existing = await db.select({ id: media.id }).from(media).where(eq(media.id, id)).limit(1);
    if (existing.length === 0) {
      throw notFound('Media not found');
    }

    await db.update(media).set({ altText }).where(eq(media.id, id));
    const result = await db.select().from(media).where(eq(media.id, id)).limit(1);

    return reply.send({ success: true, data: { media: result[0] } });
  });

  /**
   * DELETE /media/:id - Delete a media file
   */
  fastify.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
    const mediaItem = result[0];
    if (!mediaItem) {
      throw notFound('Media not found');
    }

    // Delete file from disk (ignore ENOENT — file may have been manually removed)
    const uploadsDir = getUploadsDir();
    try {
      const filePath = ensureSafePath(mediaItem.filename, uploadsDir);
      fs.unlinkSync(filePath);
    } catch {
      // File may already be gone — that's fine
    }

    await db.delete(media).where(eq(media.id, id));

    return reply.send({ success: true, data: { message: 'Media deleted' } });
  });
}
