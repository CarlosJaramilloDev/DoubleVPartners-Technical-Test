import { createDebtSchema, updateDebtSchema } from '../debt.validator';

describe('Debt Validators', () => {
  describe('createDebtSchema', () => {
    it('should validate correct debt creation data', () => {
      const validData = {
        debtorId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100.50,
        description: 'Test debt',
      };

      const result = createDebtSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate without description', () => {
      const validData = {
        debtorId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100.50,
      };

      const result = createDebtSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const invalidData = {
        debtorId: '123e4567-e89b-12d3-a456-426614174000',
        amount: -50,
      };

      const result = createDebtSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero amount', () => {
      const invalidData = {
        debtorId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 0,
      };

      const result = createDebtSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        debtorId: 'not-a-uuid',
        amount: 100.50,
      };

      const result = createDebtSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateDebtSchema', () => {
    it('should validate correct update data', () => {
      const validData = {
        amount: 150.75,
        description: 'Updated description',
      };

      const result = updateDebtSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with only amount', () => {
      const validData = {
        amount: 200.00,
      };

      const result = updateDebtSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with only description', () => {
      const validData = {
        description: 'Updated description',
      };

      const result = updateDebtSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const invalidData = {
        amount: -10,
      };

      const result = updateDebtSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

