import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export interface DebtStats {
  // Estadísticas generales
  totalPaid: number;
  totalPending: number;
  totalDebts: number;
  paidCount: number;
  pendingCount: number;
  // Estadísticas por rol
  owedToMe: number;      // Total que me deben (como acreedor)
  iOwe: number;          // Total que debo (como deudor)
  owedToMePaid: number;  // Total pagado que me debían
  iOwePaid: number;      // Total pagado que debía
}

export const getDebtStats = async (): Promise<DebtStats> => {
  const response = await api.get(API_ENDPOINTS.DEBTS.STATS);
  return response.data.data;
};

