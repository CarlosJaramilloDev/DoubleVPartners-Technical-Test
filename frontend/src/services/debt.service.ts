import api from './api';
import { API_ENDPOINTS, DEBT_STATUS } from '../utils/constants';
import type { Debt, CreateDebtInput, UpdateDebtInput, DebtStatus } from '../types/debt.types';

export const getDebts = async (status?: DebtStatus): Promise<Debt[]> => {
  const params = status && status !== DEBT_STATUS.ALL ? { status } : {};
  const response = await api.get(API_ENDPOINTS.DEBTS.LIST, { params });
  return response.data.data;
};

export const getDebtById = async (id: string): Promise<Debt> => {
  const response = await api.get(API_ENDPOINTS.DEBTS.DETAIL(id));
  return response.data.data;
};

export const createDebt = async (data: CreateDebtInput): Promise<Debt> => {
  const response = await api.post(API_ENDPOINTS.DEBTS.CREATE, data);
  return response.data.data;
};

export const updateDebt = async (id: string, data: UpdateDebtInput): Promise<Debt> => {
  const response = await api.put(API_ENDPOINTS.DEBTS.UPDATE(id), data);
  return response.data.data;
};

export const deleteDebt = async (id: string): Promise<void> => {
  await api.delete(API_ENDPOINTS.DEBTS.DELETE(id));
};

export const markDebtAsPaid = async (id: string): Promise<Debt> => {
  const response = await api.patch(API_ENDPOINTS.DEBTS.PAY(id));
  return response.data.data;
};

