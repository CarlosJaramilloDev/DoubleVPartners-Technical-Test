import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Mock del módulo env antes de importar errors.util
const mockEnv = {
  NODE_ENV: 'development' as 'development' | 'production' | 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://test',
  JWT_SECRET: 'test-secret-key-min-32-characters-long',
  JWT_EXPIRES_IN: '7d',
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'test-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret',
  DYNAMODB_TABLE_NAME: 'debt-cache',
};

jest.mock('../../config/env', () => ({
  __esModule: true,
  get default() {
    return mockEnv;
  },
}));

import { AppError, errorHandler } from '../errors.util';

describe('Errors Utility', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(404, 'Not found');

      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.isOperational).toBe(true);
    });

    it('should create AppError with isOperational false', () => {
      const error = new AppError(500, 'Server error', false);

      expect(error.isOperational).toBe(false);
    });
  });

  describe('errorHandler', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        path: '/test',
        method: 'GET',
        body: {},
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      mockNext = jest.fn();
    });

    it('should handle ZodError validation errors', () => {
      // Crear un ZodError real intentando validar datos inválidos
      const schema = z.object({
        email: z.string().email(),
      });
      
      let zodError: z.ZodError;
      try {
        schema.parse({ email: 'invalid-email' });
      } catch (error) {
        zodError = error as z.ZodError;
      }

      errorHandler(
        zodError!,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: expect.any(Array),
      });
    });

    it('should handle AppError', () => {
      const appError = new AppError(404, 'Not found');

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not found',
      });
    });

    it('should handle unknown errors in development', () => {
      // Cambiar NODE_ENV a development
      mockEnv.NODE_ENV = 'development';
      const unknownError = new Error('Unexpected error');

      errorHandler(
        unknownError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: 'Unexpected error',
        stack: expect.any(String),
      });
    });

    it('should handle unknown errors in production', () => {
      // Cambiar NODE_ENV a production
      mockEnv.NODE_ENV = 'production';
      const unknownError = new Error('Unexpected error');

      errorHandler(
        unknownError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });
});

