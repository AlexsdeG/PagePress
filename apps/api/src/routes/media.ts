// PagePress v0.0.4 - 2025-11-30
// Media upload and management routes

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { db, getUploadsDir } from '../lib/db.js';
import { media } from '../lib/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../lib/env.js';

/**
 * Allowed MIME types for uploads
 */
const ALLOWED_MIME_TYPES = [
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
];

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
 * Generate a safe filename with timestamp
 */
function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${baseName}-${timestamp}-${random}${ext}`;
}

/**
 * Get the public URL for a media file
 */
function getMediaUrl(filename: string): string {
  const baseUrl = env.NODE_ENV === 'production' 
    ? process.env.PUBLIC_URL || '' 
    : `http://localhost:${env.PORT}`;
  return `${baseUrl}/uploads/${filename}`;
}

/**
 * Register media routes
 */
export async function mediaRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /media - List all media with pagination
   */
  fastify.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const parseResult = querySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { page, limit, mimeType } = parseResult.data;
    const offset = (page - 1) * limit;

    // Build query
    let query = db.select().from(media);
    
    if (mimeType) {
      query = query.where(eq(media.mimeType, mimeType)) as typeof query;
    }

    // Get total count
    const countResult = await db.select({ id: media.id }).from(media);
    const total = countResult.length;

    // Get media files
    const result = await query
      .orderBy(desc(media.createdAt))
      .limit(limit)
      .offset(offset);

    return reply.send({
      media: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * GET /media/:id - Get single media item
   */
  fastify.get('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await db
      .select()
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    const mediaItem = result[0];
    if (!mediaItem) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Media not found',
      });
    }

    return reply.send({ media: mediaItem });
  });

  /**
   * POST /media - Upload a new file
   */
  fastify.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;

    // Get the file from multipart
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'No file uploaded',
      });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      });
    }

    // Generate safe filename
    const filename = generateSafeFilename(data.filename);
    const uploadsDir = getUploadsDir();
    const filePath = path.join(uploadsDir, filename);

    // Stream file to disk
    let fileSize = 0;
    const writeStream = fs.createWriteStream(filePath);
    
    try {
      // Create a transform to track size
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        fileSize += chunk.length;
        if (fileSize > MAX_FILE_SIZE) {
          // Clean up partial file
          writeStream.destroy();
          fs.unlinkSync(filePath);
          return reply.status(400).send({
            error: 'Validation Error',
            message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          });
        }
        chunks.push(chunk);
      }
      
      // Write all chunks
      for (const chunk of chunks) {
        writeStream.write(chunk);
      }
      writeStream.end();
      
      // Wait for write to complete
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }

    // Create database record
    const mediaId = uuidv4();
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
      message: 'File uploaded',
      media: {
        id: mediaId,
        filename,
        originalName: data.filename,
        url,
        mimeType: data.mimetype,
        size: fileSize,
        altText: null,
        uploadedBy: user.id,
        createdAt: now,
      },
    });
  });

  /**
   * PUT /media/:id - Update media metadata
   */
  fastify.put('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const parseResult = updateMediaSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid update data',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    // Check if media exists
    const existing = await db
      .select({ id: media.id })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    if (existing.length === 0) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Media not found',
      });
    }

    const { altText } = parseResult.data;

    await db.update(media).set({ altText }).where(eq(media.id, id));

    // Fetch updated media
    const result = await db
      .select()
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    return reply.send({
      message: 'Media updated',
      media: result[0],
    });
  });

  /**
   * DELETE /media/:id - Delete a media file
   */
  fastify.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Get media record
    const result = await db
      .select()
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    const mediaItem = result[0];
    if (!mediaItem) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Media not found',
      });
    }

    // Delete file from disk
    const filePath = path.join(getUploadsDir(), mediaItem.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await db.delete(media).where(eq(media.id, id));

    return reply.send({
      message: 'Media deleted',
    });
  });
}
