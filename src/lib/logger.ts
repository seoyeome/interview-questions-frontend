/**
 * 프로덕션급 로깅 유틸리티
 * - 개발 환경: 상세 로그 출력
 * - 프로덕션: ERROR만 출력 (추후 Sentry 등으로 전송 가능)
 */

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    return `[${this.context}] ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.log(this.formatMessage('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    // ERROR는 항상 출력 (프로덕션에서도)
    console.error(this.formatMessage('ERROR', message), ...args);

    // 프로덕션에서는 여기서 Sentry 등으로 전송
    // if (!isDevelopment) {
    //   Sentry.captureException(new Error(message));
    // }
  }
}

export const createLogger = (context: string): Logger => {
  return new Logger(context);
};
