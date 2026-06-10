"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 w-[90%] max-w-sm pointer-events-none sm:bottom-6 sm:w-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-5 backdrop-blur-md border pointer-events-auto transition-all ${
              t.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-600/50"
                : t.type === "error"
                ? "bg-red-500/90 text-white border-red-600/50"
                : "bg-card/90 text-foreground border-border/50"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5" />}
            {t.type === "error" && <XCircle className="h-5 w-5" />}
            {t.type === "info" && <Info className="h-5 w-5" />}
            <p className="text-sm font-semibold">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
