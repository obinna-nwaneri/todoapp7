import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import DashboardPage from '../DashboardPage';
import { AuthProvider } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth', async () => {
  const actual = await vi.importActual<typeof import('../../hooks/useAuth')>('../../hooks/useAuth');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: '1', firstName: 'Jane', lastName: 'Doe', email: 'jane@acme.com', role: 'USER', isActive: true },
      loading: false,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('../../api/tasks', () => ({
  fetchTasks: () => Promise.resolve({ data: [], page: 1, pageSize: 10, total: 0, totalPages: 1 }),
}));

vi.mock('../../api/projects', () => ({
  fetchProjects: () => Promise.resolve({ data: [], page: 1, pageSize: 10, total: 0, totalPages: 1 }),
}));

describe('DashboardPage', () => {
  it('renders dashboard counts', async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Welcome back, Jane/i)).toBeInTheDocument();
    expect(screen.getByText('My Open Tasks')).toBeInTheDocument();
  });
});
