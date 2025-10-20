"use client";
import { useState, useCallback } from "react";
import Toast from "./Toast";

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContainerProps {
  children: React.ReactNode;
}

export default function ToastContainer({ children }: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose addToast globally
  if (typeof window !== 'undefined') {
    (window as any).addToast = addToast;
  }

  return (
    <>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}

// Helper function to show toast
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration?: number) => {
  if (typeof window !== 'undefined' && (window as any).addToast) {
    (window as any).addToast({ message, type, duration });
  }
};
