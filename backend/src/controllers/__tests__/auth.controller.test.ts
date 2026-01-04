import { Request, Response, NextFunction } from 'express';
import { register, login } from '../auth.controller';
import * as authService from '../../services/auth.service';
import { AppError } from '../../utils/errors.util';

// Mock del servicio
jest.mock('../../services/auth.service');

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      mockRequest.body = userData;
      const mockUser = {
        id: 'user-id',
        email: userData.email,
        name: userData.name,
        createdAt: new Date(),
      };

      jest.spyOn(mockAuthService, 'registerUser').mockResolvedValue(mockUser);

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: mockUser,
      });
    });

    it('should handle registration errors', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'password123',
      };

      mockRequest.body = userData;
      const error = new AppError(409, 'User with this email already exists');
      jest.spyOn(mockAuthService, 'registerUser').mockRejectedValue(error);

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockRequest.body = loginData;
      const mockResult = {
        token: 'jwt-token',
        user: {
          id: 'user-id',
          email: loginData.email,
          name: 'Test User',
        },
      };

      jest.spyOn(mockAuthService, 'loginUser').mockResolvedValue(mockResult);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(loginData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockResult,
      });
    });

    it('should handle login errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockRequest.body = loginData;
      const error = new AppError(401, 'Invalid email or password');
      jest.spyOn(mockAuthService, 'loginUser').mockRejectedValue(error);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

