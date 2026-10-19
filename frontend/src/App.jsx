import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import ToastContainer from './components/common/ToastContainer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import useLanguage from './hooks/useLanguage.js';

// Login and Dashboard stay eager: Login is the near-universal first paint for
// a fresh visit, and Dashboard is the default landing route for every
// authenticated session (`/` always redirects there) — lazy-loading either
// would add a network round-trip to the one path nearly every visit takes.
// Everything reached by an explicit, later navigation is lazy instead, so a
// session that only ever touches Dashboard never downloads the rest.
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const BudgetPage = lazy(() => import('./pages/BudgetPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Scoped to the content area only — Sidebar/BottomNav/TopBar stay mounted and
// visible while a lazy page loads, instead of the whole shell flashing away.
function PageFallback() {
  const { t } = useLanguage();
  return <p className="py-10 text-center text-sm text-muted">{t('Loading…')}</p>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register"
          element={
            <Suspense fallback={<PageFallback />}>
              <RegisterPage />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<PageFallback />}>
              <ForgotPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResetPasswordPage />
            </Suspense>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/transactions"
              element={
                <Suspense fallback={<PageFallback />}>
                  <TransactionsPage />
                </Suspense>
              }
            />
            <Route
              path="/categories"
              element={
                <Suspense fallback={<PageFallback />}>
                  <CategoriesPage />
                </Suspense>
              }
            />
            <Route
              path="/budgets"
              element={
                <Suspense fallback={<PageFallback />}>
                  <BudgetPage />
                </Suspense>
              }
            />
            <Route
              path="/statistics"
              element={
                <Suspense fallback={<PageFallback />}>
                  <StatisticsPage />
                </Suspense>
              }
            />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<PageFallback />}>
                  <ProfilePage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
