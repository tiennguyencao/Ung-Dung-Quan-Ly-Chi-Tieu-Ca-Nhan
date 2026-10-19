import axiosClient from './axiosClient';

export async function listTransactions(filters = {}) {
  const { data } = await axiosClient.get('/transactions', { params: filters });
  return data.data;
}

export async function createTransaction(payload) {
  const { data } = await axiosClient.post('/transactions', payload);
  return data.data;
}

export async function updateTransaction(id, payload) {
  const { data } = await axiosClient.put(`/transactions/${id}`, payload);
  return data.data;
}

export async function deleteTransaction(id) {
  const { data } = await axiosClient.delete(`/transactions/${id}`);
  return data.data;
}
