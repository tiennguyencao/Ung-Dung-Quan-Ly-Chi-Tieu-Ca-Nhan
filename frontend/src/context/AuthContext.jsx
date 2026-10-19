import { useState, useEffect, useCallback, useMemo } from 'react';
import AuthContext from './AuthContextValue.js';
import * as authApi from '../services/authApi';
import * as userApi from '../services/userApi';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, a token in localStorage means "try to restore the session"
  // rather than "assume it's valid" — getMe() is the real check.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    userApi
      .getMe()
      .then(setUser)
      .catch((error) => {
        // A 401 means the token is invalid/expired and the axios interceptor
        // also clears it. Network errors, rate limits (429), and server errors
        // are transient: do not permanently erase a valid token for those.
        if (error.status === 401) localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  // axiosClient fires this when the API rejects the stored token on any
  // non-auth request. Clearing the user flips isAuthenticated, and
  // ProtectedRoute redirects to /login — no page reload needed.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user: loggedInUser } = await authApi.login(credentials);
    localStorage.setItem('token', token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const updated = await userApi.updateMe(patch);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, login, logout, updateProfile }),
    [user, loading, login, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
