import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TodosPage } from '../todos';
import apiClient from '../../../api/client';

describe('TodosPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders filters', () => {
    const client = new QueryClient();
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { data: [], total: 0, page: 1, limit: 10 } } as any);

    render(
      <QueryClientProvider client={client}>
        <TodosPage />
      </QueryClientProvider>,
    );

    expect(screen.getByPlaceholderText('Search todos')).toBeInTheDocument();
  });
});
