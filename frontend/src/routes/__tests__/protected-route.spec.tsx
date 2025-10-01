import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../protected-route';
import { AuthProvider } from '../../providers/auth-provider';

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/app/dashboard" element={<div>Dashboard</div>} />
            </Route>
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
