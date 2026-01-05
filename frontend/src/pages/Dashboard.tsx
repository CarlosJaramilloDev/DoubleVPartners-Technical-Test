import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button/Button';
import { Card } from '../components/common/Card/Card';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

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
        <Card>
          <h2>Bienvenido al Dashboard</h2>
          <p>Aquí podrás gestionar tus deudas.</p>
          <p className="dashboard-note">
            Esta página está en construcción. Próximamente podrás ver y gestionar tus deudas aquí.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;

