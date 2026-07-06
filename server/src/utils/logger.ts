/**
 * StadiumPulse AI - Logger Utility
 *
 * Simple structured logger. In production, replace with Winston or Pino
 * for JSON-structured logging compatible with cloud log aggregators.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};

const RESET = '\x1b[0m';

function formatMessage(level: LogLevel, module: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level];
  const prefix = `${color}[${level.toUpperCase()}]${RESET} ${timestamp} [${module}]`;
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `${prefix} ${message}${dataStr}`;
}

export function createLogger(module: string) {
  return {
    debug: (message: string, data?: unknown) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug(formatMessage('debug', module, message, data));
      }
    },
    info: (message: string, data?: unknown) => {
      // eslint-disable-next-line no-console
      console.info(formatMessage('info', module, message, data));
    },
    warn: (message: string, data?: unknown) => {
      // eslint-disable-next-line no-console
      console.warn(formatMessage('warn', module, message, data));
    },
    error: (message: string, data?: unknown) => {
      // eslint-disable-next-line no-console
      console.error(formatMessage('error', module, message, data));
    },
  };
}
