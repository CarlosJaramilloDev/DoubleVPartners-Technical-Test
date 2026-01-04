import { registerUser, loginUser } from '../auth.service';
import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password.util';
import { AppError } from '../../utils/errors.util';

jest.mock('../../config/database');
jest.mock('../../utils/password.util', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));
jest.mock('../../utils/jwt.util', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);
      mockPrisma.user.create = jest.fn().mockResolvedValue({
        id: 'user-id',
        email: userData.email,
        name: userData.name,
        createdAt: new Date(),
      });
      mockHashPassword.mockResolvedValue('hashed-password');

      const result = await registerUser(userData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockHashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'existing-id',
        email: userData.email,
      });

      await expect(registerUser(userData)).rejects.toThrow(AppError);
      await expect(registerUser(userData)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        name: 'Test User',
        passwordHash: 'hashed-password',
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(true);

      const result = await loginUser(loginData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe(loginData.email);
    });

    it('should throw error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(loginUser(loginData)).rejects.toThrow(AppError);
      await expect(loginUser(loginData)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for wrong password', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        passwordHash: 'hashed-password',
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(false);

      await expect(loginUser(loginData)).rejects.toThrow(AppError);
      await expect(loginUser(loginData)).rejects.toThrow('Invalid email or password');
    });
  });
});

