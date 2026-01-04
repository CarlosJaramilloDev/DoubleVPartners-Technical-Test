import { Request, Response, NextFunction } from 'express';
import { exportDebtsAsJSON, exportDebtsAsCSV } from '../services/export.service';

export const exportDebts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const format = (req.query.format as string) || 'json';
    const status = req.query.status as 'pending' | 'paid' | 'all' | undefined;

    if (format === 'csv') {
      const csv = await exportDebtsAsCSV(userId, status);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="deudas-${Date.now()}.csv"`
      );
      return res.send(csv);
    }

    // Default: JSON
    const data = await exportDebtsAsJSON(userId, status);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="deudas-${Date.now()}.json"`
    );
    return res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    next(error);
  }
};

