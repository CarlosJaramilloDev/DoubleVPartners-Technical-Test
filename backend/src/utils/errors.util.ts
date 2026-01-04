import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from './logger';
import env from '../config/env';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public originalError?: Error
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    logger.debug('Validation error', { errors: err.errors, body: req.body });
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err instanceof AppError) {
    logger.warn('Application error', {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
      originalError: err.originalError?.message,
    });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Error desconocido
  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // En desarrollo, mostrar más detalles
  const response: any = {
    success: false,
    message: 'Internal server error',
  };

  if (env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
  }

  return res.status(500).json(response);
};

