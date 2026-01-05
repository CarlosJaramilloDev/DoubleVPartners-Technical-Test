import { useState, useEffect } from 'react';
import type { Debt, DebtStatus } from '../../../types/debt.types';
import { getDebts, markDebtAsPaid, deleteDebt } from '../../../services/debt.service';
import { DebtCard } from '../DebtCard/DebtCard';
import { Loading } from '../../common/Loading/Loading';
import { Button } from '../../common/Button/Button';
import { DEBT_STATUS } from '../../../utils/constants';
import './DebtList.css';

interface DebtListProps {
  onEdit?: (debt: Debt) => void;
  onDebtChange?: () => void; // Callback cuando cambian las deudas
  refreshTrigger?: number; // Se incrementa cuando se crean/editan deudas
}

export const DebtList = ({ onEdit, onDebtChange, refreshTrigger = 0 }: DebtListProps) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<DebtStatus>(DEBT_STATUS.ALL);

  const loadDebts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDebts(statusFilter);
      setDebts(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al cargar las deudas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebts();
  }, [statusFilter, refreshTrigger]);

  const handlePay = async (id: string) => {
    try {
      await markDebtAsPaid(id);
      await loadDebts();
      onDebtChange?.(); // Notificar cambio para actualizar estadísticas
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al marcar la deuda como pagada');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta deuda?')) {
      return;
    }

    try {
      await deleteDebt(id);
      await loadDebts();
      onDebtChange?.(); // Notificar cambio para actualizar estadísticas
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al eliminar la deuda');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="debt-list">
      <div className="debt-list__filters">
        <Button
          variant={statusFilter === DEBT_STATUS.ALL ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(DEBT_STATUS.ALL)}
        >
          Todas
        </Button>
        <Button
          variant={statusFilter === DEBT_STATUS.PENDING ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(DEBT_STATUS.PENDING)}
        >
          Pendientes
        </Button>
        <Button
          variant={statusFilter === DEBT_STATUS.PAID ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(DEBT_STATUS.PAID)}
        >
          Pagadas
        </Button>
      </div>

      {error && <div className="debt-list__error">{error}</div>}

      {debts.length === 0 ? (
        <div className="debt-list__empty">
          <p>No hay deudas {statusFilter !== DEBT_STATUS.ALL && `con estado "${statusFilter}"`}</p>
        </div>
      ) : (
        <div className="debt-list__items">
          {debts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onPay={handlePay}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

