import express from 'express';
import cors from 'cors';
import env from './config/env';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './utils/errors.util';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/debts', debtRoutes);

// Error handler (debe ir al final)
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

