import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button/Button';
import { DebtList } from '../components/debt/DebtList/DebtList';
import { DebtForm } from '../components/debt/DebtForm/DebtForm';
import { DebtStats } from '../components/debt/DebtStats/DebtStats';
import type { Debt } from '../types/debt.types';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDebt(undefined);
    // Actualizar estadísticas y lista cuando cambien las deudas
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDebtChange = () => {
    // Actualizar estadísticas y lista cuando cambien las deudas
    setRefreshTrigger((prev) => prev + 1);
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
        <DebtStats refreshTrigger={refreshTrigger} />

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

        <DebtList 
          onEdit={handleEdit} 
          onDebtChange={handleDebtChange}
          refreshTrigger={refreshTrigger}
        />
      </main>
    </div>
  );
};

export default Dashboard;

