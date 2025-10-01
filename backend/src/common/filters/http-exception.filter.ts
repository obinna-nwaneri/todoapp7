import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const defaultMessage = status >= 500 ? 'Internal server error' : 'Request failed';

    let responseBody: any = {
      message: defaultMessage,
      code: 'UNEXPECTED_ERROR',
      details: {},
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      responseBody = {
        ...responseBody,
        message: res?.message ?? res ?? exception.message,
        code: res?.code ?? responseBody.code,
        details: res?.details ?? res,
      };
    }

    response.status(status).json(responseBody);
  }
}
