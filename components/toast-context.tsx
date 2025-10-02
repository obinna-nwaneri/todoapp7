"use client";

import { createContext } from "react";

export type ToastMessage = {
  type: "success" | "error";
  title: string;
  description?: string;
};

export type ToastContextType = {
  toast: ToastMessage | null;
  showToast: (toast: ToastMessage) => void;
  clearToast: () => void;
};

const ToastContext = createContext<ToastContextType>({
  toast: null,
  showToast: () => undefined,
  clearToast: () => undefined,
});

export default ToastContext;
