import { getDebtStats } from '../stats.service';
import prisma from '../../config/database';

jest.mock('../../config/database');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Stats Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate correct statistics', async () => {
    const userId = 'test-user-id';
    const mockDebts = [
      { amount: 100.50, isPaid: false },
      { amount: 200.75, isPaid: true },
      { amount: 50.25, isPaid: false },
      { amount: 150.00, isPaid: true },
    ];

    mockPrisma.debt.findMany = jest.fn().mockResolvedValue(mockDebts);

    const stats = await getDebtStats(userId);

    expect(stats.totalPaid).toBe(350.75); // 200.75 + 150.00
    expect(stats.totalPending).toBe(150.75); // 100.50 + 50.25
    expect(stats.totalDebts).toBe(4);
    expect(stats.paidCount).toBe(2);
    expect(stats.pendingCount).toBe(2);
  });

  it('should return zeros when user has no debts', async () => {
    const userId = 'test-user-id';

    mockPrisma.debt.findMany = jest.fn().mockResolvedValue([]);

    const stats = await getDebtStats(userId);

    expect(stats.totalPaid).toBe(0);
    expect(stats.totalPending).toBe(0);
    expect(stats.totalDebts).toBe(0);
    expect(stats.paidCount).toBe(0);
    expect(stats.pendingCount).toBe(0);
  });

  it('should round amounts to 2 decimal places', async () => {
    const userId = 'test-user-id';
    const mockDebts = [
      { amount: 100.333, isPaid: false },
      { amount: 200.666, isPaid: true },
    ];

    mockPrisma.debt.findMany = jest.fn().mockResolvedValue(mockDebts);

    const stats = await getDebtStats(userId);

    expect(stats.totalPaid).toBe(200.67); // Rounded
    expect(stats.totalPending).toBe(100.33); // Rounded
  });
});

