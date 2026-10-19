import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useLanguage from '../hooks/useLanguage.js';

// Restores the session from a stored token before deciding — redirecting to
// /login during that first check would bounce an already-logged-in user who
// just refreshed the page.
export default function ProtectedRoute() {
  const { t } = useLanguage();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-paper text-muted">{t("Loading…")}</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
