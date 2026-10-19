import axiosClient from './axiosClient';

export async function listBudgets(month) {
  const { data } = await axiosClient.get('/budgets', { params: month ? { month } : {} });
  return data.data;
}

export async function createBudget(payload) {
  const { data } = await axiosClient.post('/budgets', payload);
  return data.data;
}

export async function updateBudget(id, payload) {
  const { data } = await axiosClient.put(`/budgets/${id}`, payload);
  return data.data;
}

export async function deleteBudget(id) {
  const { data } = await axiosClient.delete(`/budgets/${id}`);
  return data.data;
}
