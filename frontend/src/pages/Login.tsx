import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../utils/constants';
import { Button } from '../components/common/Button/Button';
import { Input } from '../components/common/Input/Input';
import { Card } from '../components/common/Card/Card';
import './Auth.css';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);
      const { token, user } = response.data.data;

      login(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <h1 className="auth-title">Iniciar Sesión</h1>
        <p className="auth-subtitle">Bienvenido a DoubleV</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;

