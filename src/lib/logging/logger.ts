/**
 * Helmdash — Logger structuré avec Sentry optionnel
 *
 * Utilise Sentry si configuré (SENTRY_DSN), sinon fallback vers console.
 * Format JSON structuré pour aggregabilité (Logtail, Grafana, etc.).
 */

const SENTRY_DSN = process.env.SENTRY_DSN || '';

// Lazy-init Sentry pour éviter l'import au build si pas configuré
let sentryLoaded = false;
async function getSentry() {
  if (!SENTRY_DSN) return null;
  if (sentryLoaded) {
    try {
      const Sentry = await import('@sentry/nextjs');
      return Sentry.default || Sentry;
    } catch {
      return null;
    }
  }
  return null;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  route?: string;
  userId?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Log structuré — écrit en console + envoie à Sentry si configuré.
 */
function log(level: LogLevel, message: string, meta?: {
  route?: string;
  userId?: string;
  duration?: number;
  error?: unknown;
  [key: string]: unknown;
}) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    route: meta?.route,
    userId: meta?.userId,
    duration: meta?.duration,
    metadata: meta ? { ...meta } : undefined,
  };

  // Supprimer les champs déjà extraits du metadata pour éviter la duplication
  if (entry.metadata) {
    delete entry.metadata.route;
    delete entry.metadata.userId;
    delete entry.metadata.duration;
    delete entry.metadata.error;
  }

  // Console JSON structuré
  const formatted = JSON.stringify(entry);
  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }

  // Sentry pour les erreurs uniquement
  if (level === 'error' && SENTRY_DSN && meta?.error) {
    getSentry().then((Sentry) => {
      if (Sentry?.captureException) {
        Sentry.captureException(meta.error, {
          tags: { route: meta?.route as string },
          user: meta?.userId ? { id: meta.userId as string } : undefined,
          extra: entry.metadata as Record<string, unknown>,
        });
      }
    });
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => log('error', message, { ...meta, error }),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),

  /**
   * Middleware pour logger les appels API IA
   */
  apiCall: (route: string, userId: string, duration: number, status: 'success' | 'error', meta?: Record<string, unknown>) => {
    log(status === 'error' ? 'error' : 'info', `API ${route}`, {
      route,
      userId,
      duration,
      ...meta,
    });
  },
};