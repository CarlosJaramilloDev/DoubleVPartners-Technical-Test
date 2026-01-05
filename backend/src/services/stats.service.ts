import prisma from '../config/database';

export interface DebtStats {
  // Estadísticas generales
  totalPaid: number;
  totalPending: number;
  totalDebts: number;
  paidCount: number;
  pendingCount: number;
  // Estadísticas por rol
  owedToMe: number;      // Total que me deben (como acreedor)
  iOwe: number;          // Total que debo (como deudor)
  owedToMePaid: number;  // Total pagado que me debían
  iOwePaid: number;      // Total pagado que debía
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
      creditorId: true,
      debtorId: true,
    },
  });

  // Calcular estadísticas generales
  let totalPaid = 0;
  let totalPending = 0;
  let paidCount = 0;
  let pendingCount = 0;

  // Calcular estadísticas por rol
  let owedToMe = 0;        // Me deben (soy acreedor, pendientes)
  let iOwe = 0;            // Debo (soy deudor, pendientes)
  let owedToMePaid = 0;    // Me debían y ya pagaron
  let iOwePaid = 0;        // Debía y ya pagué

  debts.forEach((debt) => {
    const amount = Number(debt.amount);
    const isCreditor = debt.creditorId === userId;
    const isDebtor = debt.debtorId === userId;
    
    if (debt.isPaid) {
      totalPaid += amount;
      paidCount++;
      
      if (isCreditor) {
        owedToMePaid += amount;
      } else if (isDebtor) {
        iOwePaid += amount;
      }
    } else {
      totalPending += amount;
      pendingCount++;
      
      if (isCreditor) {
        owedToMe += amount;
      } else if (isDebtor) {
        iOwe += amount;
      }
    }
  });

  return {
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalPending: Math.round(totalPending * 100) / 100,
    totalDebts: debts.length,
    paidCount,
    pendingCount,
    owedToMe: Math.round(owedToMe * 100) / 100,
    iOwe: Math.round(iOwe * 100) / 100,
    owedToMePaid: Math.round(owedToMePaid * 100) / 100,
    iOwePaid: Math.round(iOwePaid * 100) / 100,
  };
};

