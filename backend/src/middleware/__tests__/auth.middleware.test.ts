import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../auth.middleware';
import { verifyToken } from '../../utils/jwt.util';
import { AppError } from '../../utils/errors.util';

jest.mock('../../utils/jwt.util');

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate user with valid token', () => {
    const token = 'valid-jwt-token';
    const payload = {
      userId: 'user-id',
      email: 'test@example.com',
    };

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };
    mockVerifyToken.mockReturnValue(payload);

    authenticate(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockVerifyToken).toHaveBeenCalledWith(token);
    expect(mockRequest.user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should reject request without authorization header', () => {
    mockRequest.headers = {};

    authenticate(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.any(AppError)
    );
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token format', () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat token',
    };

    authenticate(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.any(AppError)
    );
  });

  it('should reject request with expired token', () => {
    const token = 'expired-token';
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Invalid or expired token');
    });

    authenticate(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.any(AppError)
    );
  });
});

