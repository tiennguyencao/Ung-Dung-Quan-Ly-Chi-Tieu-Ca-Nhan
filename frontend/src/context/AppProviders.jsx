import { AuthProvider } from './AuthContext';
import { ToastProvider } from './ToastContext';
import { LanguageProvider } from './LanguageContext';

// One wrapper so main.jsx doesn't accumulate a new nested provider every time
// a global concern is added — the "state" folder grows, App's shape doesn't.
export default function AppProviders({ children }) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
