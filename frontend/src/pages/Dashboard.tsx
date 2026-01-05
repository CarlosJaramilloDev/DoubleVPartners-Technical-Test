import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button/Button';
import { DebtList } from '../components/debt/DebtList/DebtList';
import { DebtForm } from '../components/debt/DebtForm/DebtForm';
import type { Debt } from '../types/debt.types';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDebt(undefined);
    // El DebtList se recargará automáticamente cuando cambie el estado
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDebt(undefined);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>DoubleV - Gestión de Deudas</h1>
        <div className="dashboard-user">
          <span>Hola, {user?.name}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-actions">
          {!showForm && (
            <Button variant="primary" onClick={() => setShowForm(true)}>
              + Nueva Deuda
            </Button>
          )}
        </div>

        {showForm && (
          <DebtForm
            debt={editingDebt}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        )}

        <DebtList onEdit={handleEdit} />
      </main>
    </div>
  );
};

export default Dashboard;

