import { app } from 'electron';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { isDev } from './utils';

/**
 * Runtime error logging and reporting system
 * Logs errors to files for debugging packaged apps
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, any>;
}

class Logger {
  private logDir: string;
  private logFile: string;
  private errorLogFile: string;
  private maxLogSize = 5 * 1024 * 1024; // 5MB max log size

  constructor() {
    // Determine log directory based on environment
    if (isDev()) {
      this.logDir = join(process.cwd(), 'logs');
    } else {
      // Production: use app data directory
      this.logDir = join(app.getPath('userData'), 'logs');
    }

    // Ensure log directory exists
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    this.logFile = join(this.logDir, `app-${timestamp}.log`);
    this.errorLogFile = join(this.logDir, `errors-${timestamp}.log`);

    // Write initial log entry
    this.writeLog('info', 'Application started', {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      isPackaged: app.isPackaged,
      userData: app.getPath('userData'),
    });
  }

  private formatLogEntry(level: LogEntry['level'], message: string, error?: Error, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      context,
    };
  }

  private writeLog(level: LogEntry['level'], message: string, context?: Record<string, any>, error?: Error) {
    const entry = this.formatLogEntry(level, message, error, context);
    const logLine = JSON.stringify(entry) + '\n';

    try {
      // Write to main log file
      appendFileSync(this.logFile, logLine, 'utf8');

      // Write errors to separate error log
      if (level === 'error') {
        appendFileSync(this.errorLogFile, logLine, 'utf8');
      }

      // Also log to console in development
      if (isDev()) {
        const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
        consoleMethod(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, error || context || '');
      }
    } catch (err) {
      // Fallback to console if file writing fails
      console.error('Failed to write log:', err);
      console.error(`[${level.toUpperCase()}] ${message}`, error || context || '');
    }
  }

  private checkLogSize() {
    try {
      if (existsSync(this.logFile)) {
        const stats = require('fs').statSync(this.logFile);
        if (stats.size > this.maxLogSize) {
          // Rotate log file
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          const oldLogFile = join(this.logDir, `app-${timestamp}-old.log`);
          require('fs').renameSync(this.logFile, oldLogFile);
          this.logFile = join(this.logDir, `app-${timestamp}.log`);
        }
      }
    } catch (err) {
      // Ignore rotation errors
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.checkLogSize();
    this.writeLog('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.checkLogSize();
    this.writeLog('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.checkLogSize();
    this.writeLog('error', message, context, error);
  }

  debug(message: string, context?: Record<string, any>) {
    if (isDev()) {
      this.writeLog('debug', message, context);
    }
  }

  getLogPath(): string {
    return this.logFile;
  }

  getErrorLogPath(): string {
    return this.errorLogFile;
  }

  getLogDir(): string {
    return this.logDir;
  }
}

// Singleton instance
let loggerInstance: Logger | null = null;

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}

// Initialize logger early
export const logger = getLogger();

