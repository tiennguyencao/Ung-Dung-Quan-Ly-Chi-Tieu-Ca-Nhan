import axios from 'axios';

// The real HTTP client, fully configured — request/response interceptors below
// handle JWT attachment and error-shape normalization for every services/*.js
// call. Matches architecture-baseline §5 (Bearer token from localStorage) and
// api-contract-v1.0.md (response envelope).
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // A 401 from /auth/* means "wrong credentials" and belongs to the form.
    // A 401 from anywhere else means the JWT is expired or invalid, so the
    // stored token is dead — drop it and let AuthProvider send the user to
    // /login rather than leaving them clicking around a session that can
    // never succeed.
    if (status === 401 && !url.startsWith('/auth/')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:expired'));
    }
    const payload = error.response?.data;
    return Promise.reject({
      message: payload?.message || 'Something went wrong. Please try again.',
      errors: payload?.errors || [],
      status,
    });
  }
);

export default axiosClient;
