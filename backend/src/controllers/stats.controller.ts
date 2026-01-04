import { Request, Response, NextFunction } from 'express';
import { getDebtStats } from '../services/stats.service';

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const stats = await getDebtStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

