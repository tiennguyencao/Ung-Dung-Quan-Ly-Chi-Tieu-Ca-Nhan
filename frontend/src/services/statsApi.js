import axiosClient from './axiosClient';

export async function getOverview(params = {}) {
  const { data } = await axiosClient.get('/stats/overview', { params });
  return data.data;
}

export async function getByCategory(params = {}) {
  const { data } = await axiosClient.get('/stats/by-category', { params });
  return data.data;
}

export async function getComparison(params = {}) {
  const { data } = await axiosClient.get('/stats/compare', { params });
  return data.data;
}
