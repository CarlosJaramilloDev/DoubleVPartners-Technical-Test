import { Request, Response, NextFunction } from 'express';
import {
  getDebtsByUser,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
  markDebtAsPaid,
} from '../services/debt.service';
import { createDebtSchema, updateDebtSchema } from '../validators/debt.validator';

export const listDebts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const status = req.query.status as 'pending' | 'paid' | 'all' | undefined;

    const debts = await getDebtsByUser(userId, status);

    res.json({
      success: true,
      data: debts,
    });
  } catch (error) {
    next(error);
  }
};

export const getDebt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const debt = await getDebtById(id, userId);

    res.json({
      success: true,
      data: debt,
    });
  } catch (error) {
    next(error);
  }
};

export const createDebtController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const validatedData = createDebtSchema.parse(req.body);

    const debt = await createDebt(validatedData, userId);

    res.status(201).json({
      success: true,
      message: 'Debt created successfully',
      data: debt,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDebtController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const validatedData = updateDebtSchema.parse(req.body);

    const debt = await updateDebt(id, validatedData, userId);

    res.json({
      success: true,
      message: 'Debt updated successfully',
      data: debt,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDebtController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await deleteDebt(id, userId);

    res.json({
      success: true,
      message: 'Debt deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const payDebt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const debt = await markDebtAsPaid(id, userId);

    res.json({
      success: true,
      message: 'Debt marked as paid',
      data: debt,
    });
  } catch (error) {
    next(error);
  }
};

