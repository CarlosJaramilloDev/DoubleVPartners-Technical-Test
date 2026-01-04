import {
  getDebtsByUser,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
  markDebtAsPaid,
} from '../debt.service';
import prisma from '../../config/database';
import { AppError } from '../../utils/errors.util';
import * as cacheService from '../cache.service';

jest.mock('../../config/database');
jest.mock('../cache.service');
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCacheService = cacheService as jest.Mocked<typeof cacheService>;

describe('Debt Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDebtsByUser', () => {
    it('should return debts from cache if available', async () => {
      const userId = 'user-id';
      const cachedDebts = [
        {
          id: 'debt-1',
          creditorId: 'creditor-1',
          debtorId: 'debtor-1',
          amount: 100 as any,
          isPaid: false,
          createdAt: new Date(),
          creditor: { id: 'creditor-1', name: 'Creditor', email: 'c@test.com' },
          debtor: { id: 'debtor-1', name: 'Debtor', email: 'd@test.com' },
        },
      ];

      jest.spyOn(mockCacheService, 'getCachedDebtsList').mockResolvedValue(cachedDebts);

      const result = await getDebtsByUser(userId);

      expect(mockCacheService.getCachedDebtsList).toHaveBeenCalledWith(userId, 'all');
      expect(result).toEqual(cachedDebts);
      expect(mockPrisma.debt.findMany).not.toHaveBeenCalled();
    });

    it('should query database when cache is empty', async () => {
      const userId = 'user-id';
      const dbDebts = [
        {
          id: 'debt-1',
          creditorId: 'creditor-1',
          debtorId: 'debtor-1',
          amount: 100 as any,
          description: 'Test',
          isPaid: false,
          paidAt: null,
          createdAt: new Date(),
          creditor: { id: 'creditor-1', name: 'Creditor', email: 'c@test.com' },
          debtor: { id: 'debtor-1', name: 'Debtor', email: 'd@test.com' },
        },
      ];

      jest.spyOn(mockCacheService, 'getCachedDebtsList').mockResolvedValue(null);
      mockPrisma.debt.findMany = jest.fn().mockResolvedValue(dbDebts);
      jest.spyOn(mockCacheService, 'setCachedDebtsList').mockResolvedValue(undefined);

      const result = await getDebtsByUser(userId);

      expect(mockPrisma.debt.findMany).toHaveBeenCalled();
      expect(mockCacheService.setCachedDebtsList).toHaveBeenCalled();
      expect(result).toEqual(dbDebts);
    });

    it('should filter by pending status', async () => {
      const userId = 'user-id';
      jest.spyOn(mockCacheService, 'getCachedDebtsList').mockResolvedValue(null);
      mockPrisma.debt.findMany = jest.fn().mockResolvedValue([]);
      jest.spyOn(mockCacheService, 'setCachedDebtsList').mockResolvedValue(undefined);

      await getDebtsByUser(userId, 'pending');

      expect(mockPrisma.debt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPaid: false,
          }),
        })
      );
    });

    it('should filter by paid status', async () => {
      const userId = 'user-id';
      jest.spyOn(mockCacheService, 'getCachedDebtsList').mockResolvedValue(null);
      mockPrisma.debt.findMany = jest.fn().mockResolvedValue([]);
      jest.spyOn(mockCacheService, 'setCachedDebtsList').mockResolvedValue(undefined);

      await getDebtsByUser(userId, 'paid');

      expect(mockPrisma.debt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPaid: true,
          }),
        })
      );
    });
  });

  describe('getDebtById', () => {
    it('should return debt when found', async () => {
      const debtId = 'debt-id';
      const userId = 'user-id';
      const mockDebt = {
        id: debtId,
        creditorId: userId,
        debtorId: 'debtor-id',
        amount: 100 as any,
        description: 'Test',
        isPaid: false,
        paidAt: null,
        createdAt: new Date(),
        creditor: { id: userId, name: 'Creditor', email: 'c@test.com' },
        debtor: { id: 'debtor-id', name: 'Debtor', email: 'd@test.com' },
      };

      mockPrisma.debt.findFirst = jest.fn().mockResolvedValue(mockDebt);

      const result = await getDebtById(debtId, userId);

      expect(result).toEqual(mockDebt);
      expect(mockPrisma.debt.findFirst).toHaveBeenCalledWith({
        where: {
          id: debtId,
          OR: [{ creditorId: userId }, { debtorId: userId }],
        },
        include: expect.any(Object),
      });
    });

    it('should throw error when debt not found', async () => {
      const debtId = 'non-existent';
      const userId = 'user-id';

      mockPrisma.debt.findFirst = jest.fn().mockResolvedValue(null);

      await expect(getDebtById(debtId, userId)).rejects.toThrow(AppError);
      await expect(getDebtById(debtId, userId)).rejects.toThrow('Debt not found');
    });
  });

  describe('createDebt', () => {
    it('should create a debt successfully', async () => {
      const userId = 'creditor-id';
      const debtData = {
        debtorId: 'debtor-id',
        amount: 100.50,
        description: 'Test debt',
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'debtor-id',
        email: 'debtor@test.com',
        name: 'Debtor',
      });

      mockPrisma.debt.create = jest.fn().mockResolvedValue({
        id: 'new-debt-id',
        ...debtData,
        creditorId: userId,
        isPaid: false,
        createdAt: new Date(),
        creditor: { id: userId, name: 'Creditor', email: 'c@test.com' },
        debtor: { id: 'debtor-id', name: 'Debtor', email: 'd@test.com' },
      });

      jest.spyOn(mockCacheService, 'invalidateUserCache').mockResolvedValue(undefined);

      const result = await createDebt(debtData, userId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: debtData.debtorId },
      });
      expect(mockPrisma.debt.create).toHaveBeenCalled();
      expect(mockCacheService.invalidateUserCache).toHaveBeenCalledTimes(2);
      expect(result.creditorId).toBe(userId);
    });

    it('should reject creating debt with yourself', async () => {
      const userId = 'user-id';
      const debtData = {
        debtorId: userId, // Same as creditor
        amount: 100.50,
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: userId,
      });

      await expect(createDebt(debtData, userId)).rejects.toThrow(AppError);
      await expect(createDebt(debtData, userId)).rejects.toThrow(
        'Cannot create debt with yourself'
      );
    });

    it('should reject if debtor does not exist', async () => {
      const userId = 'creditor-id';
      const debtData = {
        debtorId: 'non-existent',
        amount: 100.50,
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(createDebt(debtData, userId)).rejects.toThrow(AppError);
      await expect(createDebt(debtData, userId)).rejects.toThrow('Debtor not found');
    });
  });

  describe('updateDebt', () => {
    it('should update a debt successfully', async () => {
      const userId = 'creditor-id';
      const debtId = 'debt-id';
      const updateData = {
        amount: 200.00,
        description: 'Updated',
      };

      const existingDebt = {
        id: debtId,
        creditorId: userId,
        debtorId: 'debtor-id',
        isPaid: false,
        amount: 100,
      };

      mockPrisma.debt.findFirst = jest.fn().mockResolvedValue(existingDebt);
      mockPrisma.debt.update = jest.fn().mockResolvedValue({
        ...existingDebt,
        ...updateData,
        creditor: { id: userId, name: 'Creditor', email: 'c@test.com' },
        debtor: { id: 'debtor-id', name: 'Debtor', email: 'd@test.com' },
      });

      jest.spyOn(mockCacheService, 'invalidateUserCache').mockResolvedValue(undefined);

      const result = await updateDebt(debtId, updateData, userId);

      expect(mockPrisma.debt.findFirst).toHaveBeenCalled();
      expect(mockPrisma.debt.update).toHaveBeenCalled();
      expect(mockCacheService.invalidateUserCache).toHaveBeenCalledTimes(2);
      expect(result.amount.toString()).toBe('200');
    });

    it('should reject updating paid debt', async () => {
      const userId = 'creditor-id';
      const debtId = 'debt-id';
      const updateData = { amount: 200 };

      const paidDebt = {
        id: debtId,
        creditorId: userId,
        isPaid: true,
        amount: 100,
      };

      mockPrisma.debt.findFirst = jest.fn().mockResolvedValue(paidDebt);

      await expect(updateDebt(debtId, updateData, userId)).rejects.toThrow(AppError);
      await expect(updateDebt(debtId, updateData, userId)).rejects.toThrow(
        'Cannot modify a paid debt'
      );
    });
  });

  describe('markDebtAsPaid', () => {
    it('should mark debt as paid', async () => {
      const userId = 'user-id';
      const debtId = 'debt-id';

      const existingDebt = {
        id: debtId,
        creditorId: 'creditor-id',
        debtorId: userId,
        isPaid: false,
        amount: 100,
      };

      mockPrisma.debt.findFirst = jest.fn().mockResolvedValue(existingDebt);
      mockPrisma.debt.update = jest.fn().mockResolvedValue({
        ...existingDebt,
        isPaid: true,
        paidAt: new Date(),
        creditor: { id: 'creditor-id', name: 'Creditor', email: 'c@test.com' },
        debtor: { id: userId, name: 'Debtor', email: 'd@test.com' },
      });

      jest.spyOn(mockCacheService, 'invalidateUserCache').mockResolvedValue(undefined);

      const result = await markDebtAsPaid(debtId, userId);

      expect(result.isPaid).toBe(true);
      expect(result.paidAt).toBeDefined();
      expect(mockCacheService.invalidateUserCache).toHaveBeenCalledTimes(2);
    });

    it('should reject marking already paid debt', async () => {
      const userId = 'user-id';
      const debtId = 'debt-id';

      const paidDebt = {
        id: debtId,
        creditorId: 'creditor-id',
        debtorId: userId,
        isPaid: true,
      };

      mockPrisma.debt.findFirst = jest.fn().mockResolvedValue(paidDebt);

      await expect(markDebtAsPaid(debtId, userId)).rejects.toThrow(AppError);
      await expect(markDebtAsPaid(debtId, userId)).rejects.toThrow(
        'Debt is already paid'
      );
    });
  });

  describe('deleteDebt', () => {
    it('should delete debt successfully', async () => {
      const userId = 'creditor-id';
      const debtId = 'debt-id';

      const existingDebt = {
        id: debtId,
        creditorId: userId,
        debtorId: 'debtor-id',
        isPaid: false,
        amount: 100,
      };

      mockPrisma.debt.findFirst = jest.fn().mockResolvedValue(existingDebt);
      mockPrisma.debt.delete = jest.fn().mockResolvedValue(existingDebt);
      jest.spyOn(mockCacheService, 'invalidateUserCache').mockResolvedValue(undefined);

      const result = await deleteDebt(debtId, userId);

      expect(mockPrisma.debt.findFirst).toHaveBeenCalled();
      expect(mockPrisma.debt.delete).toHaveBeenCalledWith({
        where: { id: debtId },
      });
      expect(mockCacheService.invalidateUserCache).toHaveBeenCalledTimes(2);
      expect(result.message).toBe('Debt deleted successfully');
    });

    it('should reject deleting paid debt', async () => {
      const userId = 'creditor-id';
      const debtId = 'debt-id';

      const paidDebt = {
        id: debtId,
        creditorId: userId,
        isPaid: true,
      };

      mockPrisma.debt.findFirst = jest.fn().mockResolvedValue(paidDebt);

      await expect(deleteDebt(debtId, userId)).rejects.toThrow(AppError);
      await expect(deleteDebt(debtId, userId)).rejects.toThrow(
        'Cannot delete a paid debt'
      );
    });

    it('should reject deleting non-existent debt', async () => {
      const userId = 'creditor-id';
      const debtId = 'non-existent';

      mockPrisma.debt.findFirst = jest.fn().mockResolvedValue(null);

      await expect(deleteDebt(debtId, userId)).rejects.toThrow(AppError);
      await expect(deleteDebt(debtId, userId)).rejects.toThrow(
        'Debt not found or you do not have permission to delete it'
      );
    });
  });
});

