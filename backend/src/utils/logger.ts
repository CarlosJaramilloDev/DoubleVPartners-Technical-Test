import winston from 'winston';
import env from '../config/env';

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'doublev-backend' },
  transports: [
    // Escribir todos los logs a la consola
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (stack) {
            msg += `\n${stack}`;
          }
          if (Object.keys(meta).length > 0) {
            msg += `\n${JSON.stringify(meta, null, 2)}`;
          }
          return msg;
        })
      ),
    }),
  ],
});

export default logger;

