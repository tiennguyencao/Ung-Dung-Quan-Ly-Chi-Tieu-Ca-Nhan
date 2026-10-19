import axiosClient from './axiosClient';

export async function register(payload) {
  const { data } = await axiosClient.post('/auth/register', payload);
  return data.data;
}

export async function login(payload) {
  const { data } = await axiosClient.post('/auth/login', payload);
  return data.data;
}

export async function forgotPassword(payload) {
  const { data } = await axiosClient.post('/auth/forgot-password', payload);
  return data.data;
}

export async function resetPassword(payload) {
  const { data } = await axiosClient.post('/auth/reset-password', payload);
  return data.data;
}
