import axiosClient from './axiosClient';

export async function getMe() {
  const { data } = await axiosClient.get('/users/me');
  return data.data;
}

export async function updateMe(payload) {
  const { data } = await axiosClient.put('/users/me', payload);
  return data.data;
}
