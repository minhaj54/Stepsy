'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, action?: ToastAction) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', action?: ToastAction) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[320px] max-w-md animate-in slide-in-from-right-5 duration-300 ${
              toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
              toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
              toast.type === 'warning' ? 'bg-yellow-500/90 border-yellow-400 text-white' :
              'bg-blue-500/90 border-blue-400 text-white'
            }`}
          >
            <span className="text-sm font-bold flex-1">{toast.message}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick();
                    removeToast(toast.id);
                  }}
                  className="text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-80 hover:opacity-100 transition-opacity"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
