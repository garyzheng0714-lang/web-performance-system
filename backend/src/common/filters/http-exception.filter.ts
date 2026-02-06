import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttpException ? exception.getResponse() : null;
    const message =
      typeof responseBody === 'string'
        ? responseBody
        : (responseBody as any)?.message ||
          (exception as any)?.message ||
          '服务器内部错误';

    const errorDetail =
      typeof responseBody === 'object' && responseBody !== null
        ? (responseBody as any)
        : undefined;

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} ${status} - ${message}`,
        (exception as any)?.stack || '',
      );
    }

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message.join('; ') : message,
      error: {
        statusCode: status,
        detail: errorDetail,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
