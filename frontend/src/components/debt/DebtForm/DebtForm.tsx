import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Debt, CreateDebtInput, UpdateDebtInput } from '../../../types/debt.types';
import { createDebt, updateDebt } from '../../../services/debt.service';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Card } from '../../common/Card/Card';
import './DebtForm.css';

const debtSchema = z.object({
  debtorId: z.string().uuid('Debe ser un UUID válido'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().optional(),
});

type DebtFormData = z.infer<typeof debtSchema>;

interface DebtFormProps {
  debt?: Debt;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DebtForm = ({ debt, onSuccess, onCancel }: DebtFormProps) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const isEditing = !!debt;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: debt
      ? {
          debtorId: debt.debtorId,
          amount: parseFloat(debt.amount),
          description: debt.description || '',
        }
      : undefined,
  });

  useEffect(() => {
    if (debt) {
      reset({
        debtorId: debt.debtorId,
        amount: parseFloat(debt.amount),
        description: debt.description || '',
      });
    }
  }, [debt, reset]);

  const onSubmit = async (data: DebtFormData) => {
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        const updateData: UpdateDebtInput = {
          amount: data.amount,
          description: data.description,
        };
        await updateDebt(debt.id, updateData);
      } else {
        const createData: CreateDebtInput = {
          debtorId: data.debtorId,
          amount: data.amount,
          description: data.description,
        };
        await createDebt(createData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la deuda`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="debt-form">
      <h2 className="debt-form__title">{isEditing ? 'Editar Deuda' : 'Nueva Deuda'}</h2>

      {error && <div className="debt-form__error">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="debt-form__form">
        {!isEditing && (
          <Input
            label="ID del Deudor (UUID)"
            type="text"
            placeholder="123e4567-e89b-12d3-a456-426614174000"
            error={errors.debtorId?.message}
            {...register('debtorId')}
          />
        )}

        <Input
          label="Monto"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="150.50"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />

        <Input
          label="Descripción (opcional)"
          type="text"
          placeholder="Ej: Almuerzo del viernes"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="debt-form__actions">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (isEditing ? 'Guardando...' : 'Creando...') : isEditing ? 'Guardar' : 'Crear Deuda'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

