import {
  getDebtsByUser,
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

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCacheService = cacheService as jest.Mocked<typeof cacheService>;

describe('Debt Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});

