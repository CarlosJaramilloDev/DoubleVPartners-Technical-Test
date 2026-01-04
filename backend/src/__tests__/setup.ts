// Setup file for Jest tests
// This file runs before all tests

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-token-generation-min-32-chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '3000';

// Mock Prisma Client
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    debt: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

// Mock DynamoDB Client
jest.mock('../config/dynamodb', () => ({
  __esModule: true,
  default: {
    send: jest.fn(),
  },
  dynamoDBConfig: {
    DYNAMODB_TABLE_NAME: 'test-debt-cache',
  },
}));

// Mock logger to avoid console noise during tests
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

