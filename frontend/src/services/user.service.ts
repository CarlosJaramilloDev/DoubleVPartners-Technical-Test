import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { User } from '../types/debt.types';

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/api/users');
  return response.data.data;
};

