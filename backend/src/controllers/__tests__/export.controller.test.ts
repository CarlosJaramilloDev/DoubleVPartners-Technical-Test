import { Request, Response, NextFunction } from 'express';
import { exportDebts } from '../export.controller';
import * as exportService from '../../services/export.service';

jest.mock('../../services/export.service');

const mockExportService = exportService as jest.Mocked<typeof exportService>;

describe('Export Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      user: {
        userId: 'test-user-id',
        email: 'test@example.com',
      },
    };
    mockResponse = {
      setHeader: jest.fn(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should export debts as JSON by default', async () => {
    const mockData = [
      {
        id: 'debt-1',
        creditorName: 'Creditor',
        creditorEmail: 'creditor@test.com',
        debtorName: 'Debtor',
        debtorEmail: 'debtor@test.com',
        amount: '100.50',
        description: 'Test debt',
        isPaid: false,
        paidAt: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    jest.spyOn(mockExportService, 'exportDebtsAsJSON').mockResolvedValue(mockData);

    await exportDebts(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockExportService.exportDebtsAsJSON).toHaveBeenCalledWith(
      'test-user-id',
      undefined
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should export debts as CSV when format=csv', async () => {
    mockRequest.query = { format: 'csv' };
    const mockCSV = 'ID,Acreedor,Deudor,Monto\n...';
    jest.spyOn(mockExportService, 'exportDebtsAsCSV').mockResolvedValue(mockCSV);

    await exportDebts(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockExportService.exportDebtsAsCSV).toHaveBeenCalledWith(
      'test-user-id',
      undefined
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(mockResponse.send).toHaveBeenCalledWith(mockCSV);
  });

  it('should filter by status when provided', async () => {
    mockRequest.query = { format: 'json', status: 'pending' };
    jest.spyOn(mockExportService, 'exportDebtsAsJSON').mockResolvedValue([]);

    await exportDebts(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockExportService.exportDebtsAsJSON).toHaveBeenCalledWith(
      'test-user-id',
      'pending'
    );
  });
});

