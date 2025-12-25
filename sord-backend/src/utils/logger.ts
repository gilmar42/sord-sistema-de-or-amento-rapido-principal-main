/**
 * Logger Utility
 * Gerencia logs estruturados da aplicação
 */

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatLog(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    const log = this.formatLog('INFO', message, context);
    console.log(`ℹ️  ${log}`);
  }

  warn(message: string, context?: LogContext): void {
    const log = this.formatLog('WARN', message, context);
    console.warn(`⚠️  ${log}`);
  }

  error(message: string, context?: LogContext): void {
    const log = this.formatLog('ERROR', message, context);
    console.error(`❌ ${log}`);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const log = this.formatLog('DEBUG', message, context);
      console.debug(`🐛 ${log}`);
    }
  }

  success(message: string, context?: LogContext): void {
    const log = this.formatLog('SUCCESS', message, context);
    console.log(`✅ ${log}`);
  }
}

export default new Logger();
