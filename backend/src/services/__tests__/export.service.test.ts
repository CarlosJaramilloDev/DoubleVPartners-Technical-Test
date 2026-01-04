import { exportDebtsAsJSON, exportDebtsAsCSV } from '../export.service';
import * as debtService from '../debt.service';

jest.mock('../debt.service');

const mockDebtService = debtService as jest.Mocked<typeof debtService>;

describe('Export Service', () => {
  const mockDebts = [
    {
      id: 'debt-1',
      creditorId: 'creditor-1',
      debtorId: 'debtor-1',
      amount: 100.50 as any,
      description: 'Test debt 1',
      isPaid: false,
      paidAt: null,
      createdAt: new Date('2024-01-01'),
      creditor: {
        id: 'creditor-1',
        name: 'Creditor Name',
        email: 'creditor@test.com',
      },
      debtor: {
        id: 'debtor-1',
        name: 'Debtor Name',
        email: 'debtor@test.com',
      },
    },
    {
      id: 'debt-2',
      creditorId: 'creditor-2',
      debtorId: 'debtor-2',
      amount: 200.75 as any,
      description: 'Test debt 2',
      isPaid: true,
      paidAt: new Date('2024-01-02'),
      createdAt: new Date('2024-01-01'),
      creditor: {
        id: 'creditor-2',
        name: 'Creditor 2',
        email: 'creditor2@test.com',
      },
      debtor: {
        id: 'debtor-2',
        name: 'Debtor 2',
        email: 'debtor2@test.com',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportDebtsAsJSON', () => {
    it('should export debts as JSON format', async () => {
      jest.spyOn(mockDebtService, 'getDebtsByUser').mockResolvedValue(mockDebts);

      const result = await exportDebtsAsJSON('user-id');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('creditorName');
      expect(result[0]).toHaveProperty('debtorName');
      expect(result[0]).toHaveProperty('amount');
      expect(result[0].amount).toBe('100.5');
    });

    it('should handle debts without description', async () => {
      const debtsWithoutDesc = [
        {
          ...mockDebts[0],
          description: null,
        },
      ];
      jest.spyOn(mockDebtService, 'getDebtsByUser').mockResolvedValue(debtsWithoutDesc);

      const result = await exportDebtsAsJSON('user-id');

      expect(result[0].description).toBeNull();
    });
  });

  describe('exportDebtsAsCSV', () => {
    it('should export debts as CSV format', async () => {
      jest.spyOn(mockDebtService, 'getDebtsByUser').mockResolvedValue(mockDebts);

      const result = await exportDebtsAsCSV('user-id');

      expect(result).toContain('ID');
      expect(result).toContain('Acreedor');
      expect(result).toContain('Deudor');
      expect(result).toContain('100.5');
      expect(result).toContain('200.75');
      expect(result.split('\n').length).toBeGreaterThan(2); // Header + data rows
    });

    it('should return message when no debts', async () => {
      jest.spyOn(mockDebtService, 'getDebtsByUser').mockResolvedValue([]);

      const result = await exportDebtsAsCSV('user-id');

      expect(result).toBe('No hay deudas para exportar');
    });

    it('should escape commas in CSV', async () => {
      const debtWithComma = [
        {
          ...mockDebts[0],
          description: 'Debt, with comma',
        },
      ];
      jest.spyOn(mockDebtService, 'getDebtsByUser').mockResolvedValue(debtWithComma);

      const result = await exportDebtsAsCSV('user-id');

      expect(result).toContain('"Debt, with comma"');
    });
  });
});

