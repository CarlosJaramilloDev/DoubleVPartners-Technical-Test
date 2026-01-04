import { Request, Response, NextFunction } from 'express';
import {
  listDebts,
  getDebt,
  createDebtController,
  updateDebtController,
  deleteDebtController,
  payDebt,
} from '../debt.controller';
import * as debtService from '../../services/debt.service';
import { AppError } from '../../utils/errors.util';

jest.mock('../../services/debt.service');

const mockDebtService = debtService as jest.Mocked<typeof debtService>;

describe('Debt Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: {
        userId: 'test-user-id',
        email: 'test@example.com',
      },
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('listDebts', () => {
    it('should list all debts', async () => {
      const mockDebts = [
        {
          id: 'debt-1',
          amount: 100,
          isPaid: false,
          creditor: { id: 'user-1', name: 'Creditor', email: 'c@test.com' },
          debtor: { id: 'user-2', name: 'Debtor', email: 'd@test.com' },
        },
      ];

      jest.spyOn(mockDebtService, 'getDebtsByUser').mockResolvedValue(mockDebts);

      await listDebts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockDebtService.getDebtsByUser).toHaveBeenCalledWith(
        'test-user-id',
        undefined
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockDebts,
      });
    });

    it('should filter debts by status', async () => {
      mockRequest.query = { status: 'pending' };
      jest.spyOn(mockDebtService, 'getDebtsByUser').mockResolvedValue([]);

      await listDebts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockDebtService.getDebtsByUser).toHaveBeenCalledWith(
        'test-user-id',
        'pending'
      );
    });
  });

  describe('getDebt', () => {
    it('should get a specific debt', async () => {
      const debtId = 'debt-id';
      mockRequest.params = { id: debtId };
      const mockDebt = {
        id: debtId,
        creditorId: 'user-1',
        debtorId: 'user-2',
        amount: 100 as any,
        description: 'Test debt',
        isPaid: false,
        paidAt: null,
        createdAt: new Date(),
        creditor: { id: 'user-1', name: 'Creditor', email: 'c@test.com' },
        debtor: { id: 'user-2', name: 'Debtor', email: 'd@test.com' },
      };

      jest.spyOn(mockDebtService, 'getDebtById').mockResolvedValue(mockDebt);

      await getDebt(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockDebtService.getDebtById).toHaveBeenCalledWith(
        debtId,
        'test-user-id'
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockDebt,
      });
    });

    it('should handle debt not found', async () => {
      const debtId = 'non-existent';
      mockRequest.params = { id: debtId };
      const error = new AppError(404, 'Debt not found');
      jest.spyOn(mockDebtService, 'getDebtById').mockRejectedValue(error);

      await getDebt(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createDebtController', () => {
    it('should create a debt successfully', async () => {
      const debtData = {
        debtorId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100.50,
        description: 'Test debt',
      };

      mockRequest.body = debtData;
      const mockDebt = {
        id: 'new-debt-id',
        creditorId: 'test-user-id',
        debtorId: '123e4567-e89b-12d3-a456-426614174000',
        amount: debtData.amount as any,
        description: debtData.description,
        isPaid: false,
        paidAt: null,
        createdAt: new Date(),
        creditor: { id: 'test-user-id', name: 'Creditor', email: 'c@test.com' },
        debtor: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Debtor', email: 'd@test.com' },
      };

      jest.spyOn(mockDebtService, 'createDebt').mockResolvedValue(mockDebt);

      await createDebtController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockDebtService.createDebt).toHaveBeenCalledWith(
        debtData,
        'test-user-id'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Debt created successfully',
        data: mockDebt,
      });
    });
  });

  describe('payDebt', () => {
    it('should mark debt as paid', async () => {
      const debtId = 'debt-id';
      mockRequest.params = { id: debtId };
      const mockPaidDebt = {
        id: debtId,
        creditorId: 'creditor-id',
        debtorId: 'test-user-id',
        amount: 100 as any,
        description: 'Test debt',
        isPaid: true,
        paidAt: new Date(),
        createdAt: new Date(),
        creditor: { id: 'creditor-id', name: 'Creditor', email: 'c@test.com' },
        debtor: { id: 'test-user-id', name: 'Debtor', email: 'd@test.com' },
      };

      jest.spyOn(mockDebtService, 'markDebtAsPaid').mockResolvedValue(mockPaidDebt);

      await payDebt(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockDebtService.markDebtAsPaid).toHaveBeenCalledWith(
        debtId,
        'test-user-id'
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Debt marked as paid',
        data: mockPaidDebt,
      });
    });
  });
});

