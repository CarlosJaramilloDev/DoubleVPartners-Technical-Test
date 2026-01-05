import { useState, useEffect } from 'react';
import { getDebtStats, type DebtStats } from '../../../services/stats.service';
import { formatCurrencyCOP } from '../../../utils/format.util';
import { Card } from '../../common/Card/Card';
import { Loading } from '../../common/Loading/Loading';
import './DebtStats.css';

interface DebtStatsProps {
  refreshTrigger?: number; // Se incrementa cuando cambian las deudas
}

export const DebtStats = ({ refreshTrigger = 0 }: DebtStatsProps) => {
  const [stats, setStats] = useState<DebtStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDebtStats();
      setStats(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="debt-stats">
        <Loading />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="debt-stats">
        <div className="debt-stats__error">{error}</div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="debt-stats-container">
      {/* Estadísticas por Rol */}
      <Card className="debt-stats">
        <h2 className="debt-stats__title">Resumen por rol</h2>
        <div className="debt-stats__grid">
          <div className="debt-stats__item debt-stats__item--owed">
            <div className="debt-stats__label">Cuánto me deben</div>
            <div className="debt-stats__value">{formatCurrencyCOP(stats.owedToMe)}</div>
            <div className="debt-stats__sub-label">Pendiente por cobrar</div>
          </div>

          <div className="debt-stats__item debt-stats__item--owed-paid">
            <div className="debt-stats__label">Cuánto me han pagado</div>
            <div className="debt-stats__value">{formatCurrencyCOP(stats.owedToMePaid)}</div>
            <div className="debt-stats__sub-label">Ya recibido</div>
          </div>

          <div className="debt-stats__item debt-stats__item--owe">
            <div className="debt-stats__label">Cuánto debo</div>
            <div className="debt-stats__value">{formatCurrencyCOP(stats.iOwe)}</div>
            <div className="debt-stats__sub-label">Pendiente por pagar</div>
          </div>

          <div className="debt-stats__item debt-stats__item--owe-paid">
            <div className="debt-stats__label">Cuánto he pagado</div>
            <div className="debt-stats__value">{formatCurrencyCOP(stats.iOwePaid)}</div>
            <div className="debt-stats__sub-label">Ya pagado</div>
          </div>
        </div>
      </Card>

      {/* Estadísticas Generales */}
      <Card className="debt-stats">
        <h2 className="debt-stats__title">Resumen general</h2>
        <div className="debt-stats__grid">
          <div className="debt-stats__item debt-stats__item--pending">
            <div className="debt-stats__label">Total pendiente</div>
            <div className="debt-stats__value">{formatCurrencyCOP(stats.totalPending)}</div>
            <div className="debt-stats__count">{stats.pendingCount} deuda{stats.pendingCount !== 1 ? 's' : ''}</div>
          </div>

          <div className="debt-stats__item debt-stats__item--paid">
            <div className="debt-stats__label">Total pagado</div>
            <div className="debt-stats__value">{formatCurrencyCOP(stats.totalPaid)}</div>
            <div className="debt-stats__count">{stats.paidCount} deuda{stats.paidCount !== 1 ? 's' : ''}</div>
          </div>

          <div className="debt-stats__item debt-stats__item--total">
            <div className="debt-stats__label">Total de deudas</div>
            <div className="debt-stats__value">{stats.totalDebts}</div>
            <div className="debt-stats__count">en total</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

