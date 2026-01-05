import express from 'express';
import cors from 'cors';
import env from './config/env';
import authRoutes from './routes/auth.routes';
import debtRoutes from './routes/debt.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './utils/errors.util';
import { requestLogger } from './middleware/logger.middleware';
import logger from './utils/logger';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/users', userRoutes);

// Error handler (debe ir al final)
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

