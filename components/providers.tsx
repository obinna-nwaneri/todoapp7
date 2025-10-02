"use client";

import { ReactNode, useMemo, useState } from "react";
import { SessionProvider } from "next-auth/react";
import ToastContext, { ToastMessage } from "./toast-context";

export default function Providers({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const value = useMemo(
    () => ({
      toast,
      showToast: (message: ToastMessage) => setToast(message),
      clearToast: () => setToast(null),
    }),
    [toast],
  );

  return (
    <SessionProvider>
      <ToastContext.Provider value={value}>
        {toast ? (
          <div className={`alert ${toast.type === "error" ? "error" : "success"}`}>
            <strong>{toast.title}</strong>
            <div>{toast.description}</div>
          </div>
        ) : null}
        {children}
      </ToastContext.Provider>
    </SessionProvider>
  );
}
