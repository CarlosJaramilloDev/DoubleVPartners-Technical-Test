import { Request, Response, NextFunction } from 'express';
import { getAllUsers } from '../services/user.service';

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const users = await getAllUsers(userId);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

