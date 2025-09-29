import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext, AuthContextValue } from "./features/auth/AuthContext";

type TestWrapperProps = {
  children: React.ReactNode;
  authOverride?: Partial<AuthContextValue>;
};

const defaultAuth: AuthContextValue = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  changePassword: async () => {},
  loading: false,
};

const createWrapper = ({ authOverride }: { authOverride?: Partial<AuthContextValue> } = {}) => {
  const queryClient = new QueryClient();
  const authValue = { ...defaultAuth, ...authOverride };

  return ({ children }: TestWrapperProps) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { authOverride?: Partial<AuthContextValue> },
) => {
  const wrapper = createWrapper({ authOverride: options?.authOverride });
  return render(ui, { wrapper, ...options });
};

export * from "@testing-library/react";
