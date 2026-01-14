/**
 * Structured Logger
 * Provides consistent, searchable logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    userId?: string;
    requestId?: string;
    endpoint?: string;
    duration?: number;
    [key: string]: any;
}

class Logger {
    private logLevel: LogLevel;

    constructor() {
        this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }

    private formatLog(level: LogLevel, message: string, context?: LogContext) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...context,
        });
    }

    debug(message: string, context?: LogContext) {
        if (this.shouldLog('debug')) {
            console.log(this.formatLog('debug', message, context));
        }
    }

    info(message: string, context?: LogContext) {
        if (this.shouldLog('info')) {
            console.log(this.formatLog('info', message, context));
        }
    }

    warn(message: string, context?: LogContext) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatLog('warn', message, context));
        }
    }

    error(message: string, error?: Error | unknown, context?: LogContext) {
        if (this.shouldLog('error')) {
            const errorContext = error instanceof Error
                ? {
                    errorMessage: error.message,
                    errorStack: error.stack,
                    errorName: error.name,
                }
                : { error: String(error) };

            console.error(
                this.formatLog('error', message, {
                    ...context,
                    ...errorContext,
                })
            );
        }
    }
}

// Export singleton instance
export const logger = new Logger();

// Helper to generate request ID
export function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
