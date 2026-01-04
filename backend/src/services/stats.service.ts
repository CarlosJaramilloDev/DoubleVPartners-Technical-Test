import prisma from '../config/database';

export interface DebtStats {
  totalPaid: number;
  totalPending: number;
  totalDebts: number;
  paidCount: number;
  pendingCount: number;
}

export const getDebtStats = async (userId: string): Promise<DebtStats> => {
  // Obtener todas las deudas del usuario
  const debts = await prisma.debt.findMany({
    where: {
      OR: [
        { creditorId: userId },
        { debtorId: userId },
      ],
    },
    select: {
      amount: true,
      isPaid: true,
    },
  });

  // Calcular estadísticas
  let totalPaid = 0;
  let totalPending = 0;
  let paidCount = 0;
  let pendingCount = 0;

  debts.forEach((debt) => {
    const amount = Number(debt.amount);
    
    if (debt.isPaid) {
      totalPaid += amount;
      paidCount++;
    } else {
      totalPending += amount;
      pendingCount++;
    }
  });

  return {
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalPending: Math.round(totalPending * 100) / 100,
    totalDebts: debts.length,
    paidCount,
    pendingCount,
  };
};

