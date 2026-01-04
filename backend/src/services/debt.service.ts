import prisma from '../config/database';
import { CreateDebtInput, UpdateDebtInput } from '../validators/debt.validator';
import { AppError } from '../utils/errors.util';
import { invalidateUserCache, getCachedDebtsList, setCachedDebtsList } from './cache.service';
import logger from '../utils/logger';

export const getDebtsByUser = async (userId: string, status?: 'pending' | 'paid' | 'all') => {
  const cacheStatus = status || 'all';

  // Intentar obtener del caché primero
  try {
    const cachedDebts = await getCachedDebtsList(userId, cacheStatus);
    if (cachedDebts) {
      logger.debug('Debts retrieved from cache', { userId, status: cacheStatus });
      return cachedDebts;
    }
  } catch (error) {
    logger.warn('Error reading from cache, falling back to database', { error });
  }

  // Si no hay caché, consultar la base de datos
  const where: any = {
    OR: [
      { creditorId: userId },
      { debtorId: userId },
    ],
  };

  if (status === 'pending') {
    where.isPaid = false;
  } else if (status === 'paid') {
    where.isPaid = true;
  }
  // Si status es 'all' o undefined, no agregamos filtro de isPaid

  const debts = await prisma.debt.findMany({
    where,
    include: {
      creditor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      debtor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Guardar en caché para próximas consultas
  try {
    await setCachedDebtsList(userId, cacheStatus, debts);
    logger.debug('Debts cached', { userId, status: cacheStatus, count: debts.length });
  } catch (error) {
    logger.warn('Error caching debts', { error });
  }

  return debts;
};

export const getDebtById = async (debtId: string, userId: string) => {
  const debt = await prisma.debt.findFirst({
    where: {
      id: debtId,
      OR: [
        { creditorId: userId },
        { debtorId: userId },
      ],
    },
    include: {
      creditor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      debtor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!debt) {
    throw new AppError(404, 'Debt not found');
  }

  return debt;
};

export const createDebt = async (data: CreateDebtInput, creditorId: string) => {
  // Validar que el deudor existe
  const debtor = await prisma.user.findUnique({
    where: { id: data.debtorId },
  });

  if (!debtor) {
    throw new AppError(404, 'Debtor not found');
  }

  // Validar que no es el mismo usuario
  if (data.debtorId === creditorId) {
    throw new AppError(400, 'Cannot create debt with yourself');
  }

  const debt = await prisma.debt.create({
    data: {
      creditorId,
      debtorId: data.debtorId,
      amount: data.amount,
      description: data.description,
    },
    include: {
      creditor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      debtor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Invalidar caché de ambos usuarios
  await invalidateUserCache(creditorId);
  await invalidateUserCache(data.debtorId);

  return debt;
};

export const updateDebt = async (
  debtId: string,
  data: UpdateDebtInput,
  userId: string
) => {
  // Buscar la deuda y verificar permisos
  const debt = await prisma.debt.findFirst({
    where: {
      id: debtId,
      creditorId: userId, // Solo el acreedor puede editar
    },
  });

  if (!debt) {
    throw new AppError(404, 'Debt not found or you do not have permission to edit it');
  }

  // Validación: deudas pagadas no pueden modificarse
  if (debt.isPaid) {
    throw new AppError(400, 'Cannot modify a paid debt');
  }

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: {
      amount: data.amount,
      description: data.description,
    },
    include: {
      creditor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      debtor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Invalidar caché de ambos usuarios
  await invalidateUserCache(debt.creditorId);
  await invalidateUserCache(debt.debtorId);

  return updatedDebt;
};

export const deleteDebt = async (debtId: string, userId: string) => {
  // Buscar la deuda y verificar permisos
  const debt = await prisma.debt.findFirst({
    where: {
      id: debtId,
      creditorId: userId, // Solo el acreedor puede eliminar
    },
  });

  if (!debt) {
    throw new AppError(404, 'Debt not found or you do not have permission to delete it');
  }

  // Validación: deudas pagadas no pueden eliminarse
  if (debt.isPaid) {
    throw new AppError(400, 'Cannot delete a paid debt');
  }

  await prisma.debt.delete({
    where: { id: debtId },
  });

  // Invalidar caché de ambos usuarios
  await invalidateUserCache(debt.creditorId);
  await invalidateUserCache(debt.debtorId);

  return { message: 'Debt deleted successfully' };
};

export const markDebtAsPaid = async (debtId: string, userId: string) => {
  // Buscar la deuda y verificar permisos
  const debt = await prisma.debt.findFirst({
    where: {
      id: debtId,
      OR: [
        { creditorId: userId },
        { debtorId: userId },
      ],
    },
  });

  if (!debt) {
    throw new AppError(404, 'Debt not found');
  }

  if (debt.isPaid) {
    throw new AppError(400, 'Debt is already paid');
  }

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: {
      isPaid: true,
      paidAt: new Date(),
    },
    include: {
      creditor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      debtor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Invalidar caché de ambos usuarios
  await invalidateUserCache(debt.creditorId);
  await invalidateUserCache(debt.debtorId);

  return updatedDebt;
};

