import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../../lib/api";
import { PaginatedResponse, Task } from "../../types/task";

export type TaskFilters = {
  page?: number;
  status?: string;
  priority?: string;
  due?: string;
  search?: string;
  ordering?: string;
};

const buildQueryString = (filters: TaskFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
};

export const useTasks = (filters: TaskFilters) =>
  useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const query = buildQueryString(filters);
      const url = query ? `/api/todos/?${query}` : "/api/todos/";
      const response = await api.get<PaginatedResponse<Task>>(url);
      return response.data;
    },
    keepPreviousData: true,
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Task>) => api.post<Task>("/api/todos/", payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
      api.patch<Task>(`/api/todos/${id}/`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/todos/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
