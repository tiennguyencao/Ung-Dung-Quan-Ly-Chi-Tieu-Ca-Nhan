import { useState, useCallback, useRef, useMemo } from 'react';
import ToastContext from './ToastContextValue.js';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Without this, a plain object literal here gets a new reference on every
  // ToastProvider render, re-rendering every consumer even when neither
  // value actually changed.
  const value = useMemo(() => ({ toasts, addToast }), [toasts, addToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
