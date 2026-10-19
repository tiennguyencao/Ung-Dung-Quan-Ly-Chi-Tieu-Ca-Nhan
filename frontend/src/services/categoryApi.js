import axiosClient from './axiosClient';

export async function listCategories() {
  const { data } = await axiosClient.get('/categories');
  return data.data;
}

export async function createCategory(payload) {
  const { data } = await axiosClient.post('/categories', payload);
  return data.data;
}

export async function updateCategory(id, payload) {
  const { data } = await axiosClient.put(`/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id) {
  const { data } = await axiosClient.delete(`/categories/${id}`);
  return data.data;
}
