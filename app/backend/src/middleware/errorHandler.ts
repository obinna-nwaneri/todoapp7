import { NextFunction, Request, Response } from 'express';
import { AppError, errorResponse } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err instanceof AppError ? err.status : 500;
  if (!(err instanceof AppError)) {
    logger.error('Unhandled error', { message: err.message, stack: err.stack });
  }
  res.status(status).json(errorResponse(err));
}
