import { Request, Response, NextFunction } from 'express';
import { getStats } from '../stats.controller';
import * as statsService from '../../services/stats.service';

jest.mock('../../services/stats.service');

const mockStatsService = statsService as jest.Mocked<typeof statsService>;

describe('Stats Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: {
        userId: 'test-user-id',
        email: 'test@example.com',
      },
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should return debt statistics', async () => {
    const mockStats = {
      totalPaid: 250.50,
      totalPending: 150.00,
      totalDebts: 5,
      paidCount: 2,
      pendingCount: 3,
    };

    jest.spyOn(mockStatsService, 'getDebtStats').mockResolvedValue(mockStats);

    await getStats(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockStatsService.getDebtStats).toHaveBeenCalledWith('test-user-id');
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockStats,
    });
  });
});

