// PagePress v0.0.14 - 2026-02-28
// Periodic session cleanup using setInterval

import { cleanupExpiredSessions } from './auth.js';

/**
 * Cleanup interval in milliseconds (15 minutes)
 */
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the periodic session cleanup job
 */
export function startSessionCleanup(logger?: { info: (msg: string) => void; error: (obj: unknown, msg: string) => void }): void {
  if (cleanupTimer) {
    return; // Already running
  }

  cleanupTimer = setInterval(async () => {
    try {
      const deleted = await cleanupExpiredSessions();
      if (deleted > 0) {
        logger?.info(`Session cleanup: removed ${deleted} expired session(s)`);
      }
    } catch (error) {
      logger?.error(error, 'Session cleanup failed');
    }
  }, CLEANUP_INTERVAL_MS);

  // Don't prevent process exit
  cleanupTimer.unref();

  logger?.info('Session cleanup cron started (every 15 minutes)');
}

/**
 * Stop the periodic session cleanup job
 */
export function stopSessionCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
