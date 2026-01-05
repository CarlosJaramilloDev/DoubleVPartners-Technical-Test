import type { Debt } from '../../../types/debt.types';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { formatCurrencyCOP } from '../../../utils/format.util';
import './DebtCard.css';

interface DebtCardProps {
  debt: Debt;
  onPay?: (id: string) => void;
  onEdit?: (debt: Debt) => void;
  onDelete?: (id: string) => void;
}

export const DebtCard = ({ debt, onPay, onEdit, onDelete }: DebtCardProps) => {
  const { user } = useAuth();
  const isCreditor = user?.id === debt.creditorId;
  const isDebtor = user?.id === debt.debtorId;
  const canEdit = isCreditor && !debt.isPaid;
  const canDelete = isCreditor && !debt.isPaid;
  const canPay = isDebtor && !debt.isPaid;

  const formatAmount = (amount: string) => {
    return formatCurrencyCOP(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className={`debt-card ${debt.isPaid ? 'debt-card--paid' : ''}`}>
      <div className="debt-card__header">
        <div className="debt-card__amount">{formatAmount(debt.amount)}</div>
        <div className={`debt-card__status ${debt.isPaid ? 'debt-card__status--paid' : 'debt-card__status--pending'}`}>
          {debt.isPaid ? 'Pagada' : 'Pendiente'}
        </div>
      </div>

      <div className="debt-card__body">
        {isCreditor && (
          <p className="debt-card__info">
            <strong>Te debe:</strong> {debt.debtor.name} ({debt.debtor.email})
          </p>
        )}
        {isDebtor && (
          <p className="debt-card__info">
            <strong>Debes a:</strong> {debt.creditor.name} ({debt.creditor.email})
          </p>
        )}

        {debt.description && (
          <p className="debt-card__description">{debt.description}</p>
        )}

        <p className="debt-card__date">Creada: {formatDate(debt.createdAt)}</p>
        {debt.paidAt && (
          <p className="debt-card__date">Pagada: {formatDate(debt.paidAt)}</p>
        )}
      </div>

      <div className="debt-card__actions">
        {canPay && onPay && (
          <Button variant="primary" size="sm" onClick={() => onPay(debt.id)}>
            Marcar como Pagada
          </Button>
        )}
        {canEdit && onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(debt)}>
            Editar
          </Button>
        )}
        {canDelete && onDelete && (
          <Button variant="danger" size="sm" onClick={() => onDelete(debt.id)}>
            Eliminar
          </Button>
        )}
      </div>
    </Card>
  );
};

