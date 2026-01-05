// Constantes de la aplicación

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
  },
  DEBTS: {
    LIST: '/api/debts',
    DETAIL: (id: string) => `/api/debts/${id}`,
    CREATE: '/api/debts',
    UPDATE: (id: string) => `/api/debts/${id}`,
    DELETE: (id: string) => `/api/debts/${id}`,
    PAY: (id: string) => `/api/debts/${id}/pay`,
    EXPORT: '/api/debts/export',
    STATS: '/api/debts/stats',
  },
} as const;

export const DEBT_STATUS = {
  ALL: 'all',
  PENDING: 'pending',
  PAID: 'paid',
} as const;

export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'doublev_token',
  USER: 'doublev_user',
} as const;

