import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ToastProps } from "@/ui/components/Toast/Toast";

export interface ToastOptions {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (opts: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (options: ToastOptions) => {
      const id = Math.random().toString(36).slice(2);
      
      const newToast: ToastProps = {
        id,
        type: options.type,
        title: options.title,
        message: options.message,
        duration: options.duration || 5000,
        onClose: () => removeToast(id),
      };
      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) =>
      addToast({ type: "success", title, message, duration }),
    [addToast]
  );

  const showError = useCallback(
    (title: string, message?: string, duration?: number) =>
      addToast({ type: "error", title, message, duration }),
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration?: number) =>
      addToast({ type: "warning", title, message, duration }),
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) =>
      addToast({ type: "info", title, message, duration }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

export default useToast;
