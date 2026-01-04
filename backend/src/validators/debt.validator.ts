import { z } from 'zod';

export const createDebtSchema = z.object({
  debtorId: z.string().uuid('Invalid debtor ID format'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
});

export const updateDebtSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0').optional(),
  description: z.string().optional(),
});

export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;

