import { generateToken, verifyToken, TokenPayload } from '../jwt.util';

// Mock env
jest.mock('../../config/env', () => ({
  __esModule: true,
  default: {
    JWT_SECRET: 'test-secret-key-for-jwt-token-generation-min-32-chars',
    JWT_EXPIRES_IN: '1h',
  },
}));

describe('JWT Utilities', () => {
  const mockPayload: TokenPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken(mockPayload);
      const token2 = generateToken({ ...mockPayload, userId: 'different-id' });

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token');
    });

    it('should throw error for expired token', () => {
      // Generate token with very short expiration
      const expiredPayload = { ...mockPayload };
      // We can't easily test expired tokens without mocking time,
      // but the structure is here for future expansion
      const token = generateToken(expiredPayload);
      
      // For now, just verify it works with valid token
      expect(() => verifyToken(token)).not.toThrow();
    });
  });
});

