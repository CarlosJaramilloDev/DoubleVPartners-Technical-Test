export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Debt {
  id: string;
  creditorId: string;
  debtorId: string;
  amount: string;
  description: string | null;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
  creditor: User;
  debtor: User;
}

export interface CreateDebtInput {
  debtorId: string;
  amount: number;
  description?: string;
}

export interface UpdateDebtInput {
  amount?: number;
  description?: string;
}

export type DebtStatus = 'all' | 'pending' | 'paid';

