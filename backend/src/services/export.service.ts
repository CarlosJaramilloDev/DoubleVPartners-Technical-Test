import { Debt } from '@prisma/client';
import { getDebtsByUser } from './debt.service';

export interface DebtExport {
  id: string;
  creditorName: string;
  creditorEmail: string;
  debtorName: string;
  debtorEmail: string;
  amount: string;
  description: string | null;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
}

export const exportDebtsAsJSON = async (
  userId: string,
  status?: 'pending' | 'paid' | 'all'
): Promise<DebtExport[]> => {
  const debts = await getDebtsByUser(userId, status);

  return debts.map((debt) => ({
    id: debt.id,
    creditorName: debt.creditor.name,
    creditorEmail: debt.creditor.email,
    debtorName: debt.debtor.name,
    debtorEmail: debt.debtor.email,
    amount: debt.amount.toString(),
    description: debt.description,
    isPaid: debt.isPaid,
    paidAt: debt.paidAt?.toISOString() || null,
    createdAt: debt.createdAt.toISOString(),
  }));
};

export const exportDebtsAsCSV = async (
  userId: string,
  status?: 'pending' | 'paid' | 'all'
): Promise<string> => {
  const debts = await exportDebtsAsJSON(userId, status);

  if (debts.length === 0) {
    return 'No hay deudas para exportar';
  }

  // Headers
  const headers = [
    'ID',
    'Acreedor',
    'Email Acreedor',
    'Deudor',
    'Email Deudor',
    'Monto',
    'Descripción',
    'Pagada',
    'Fecha Pago',
    'Fecha Creación',
  ];

  // CSV rows
  const rows = debts.map((debt) => [
    debt.id,
    debt.creditorName,
    debt.creditorEmail,
    debt.debtorName,
    debt.debtorEmail,
    debt.amount,
    debt.description || '',
    debt.isPaid ? 'Sí' : 'No',
    debt.paidAt || '',
    debt.createdAt,
  ]);

  // Escape commas and quotes in CSV
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvRows = [headers.map(escapeCSV).join(',')];
  rows.forEach((row) => {
    csvRows.push(row.map((cell) => escapeCSV(String(cell))).join(','));
  });

  return csvRows.join('\n');
};

