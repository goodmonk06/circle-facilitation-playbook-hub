type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private context: LogContext = {}

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const combinedContext = { ...this.context, ...context }
    const contextStr = Object.keys(combinedContext).length > 0
      ? ` ${JSON.stringify(combinedContext)}`
      : ''

    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context }
  }

  clearContext(): void {
    this.context = {}
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = { ...context }

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } else if (error) {
      errorContext.error = error
    }

    console.error(this.formatMessage('error', message, errorContext))
  }

  child(context: LogContext): Logger {
    const childLogger = new Logger()
    childLogger.context = { ...this.context, ...context }
    return childLogger
  }
}

// Singleton instance
export const logger = new Logger()

// Helper for creating request-scoped loggers
export function createRequestLogger(requestId: string): Logger {
  return logger.child({ requestId })
}
