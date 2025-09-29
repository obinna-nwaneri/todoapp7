import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../../lib/api";
import { PaginatedResponse, Task } from "../../types/task";

export type AdminMetrics = {
  total_users: number;
  total_tasks: number;
  active_last_7_days: number;
  active_last_30_days: number;
  tasks_by_status: { status: string; total: number }[];
  tasks_by_priority: { priority: string; total: number }[];
};

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  last_login: string | null;
  date_joined: string;
  task_count: number;
};

export type ActivityLog = {
  id: number;
  user: string;
  action: string;
  context: Record<string, unknown>;
  created_at: string;
};

export const useAdminMetrics = () =>
  useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: async () => {
      const response = await api.get<AdminMetrics>("/api/adminpanel/metrics/");
      return response.data;
    },
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await api.get<AdminUser[]>("/api/adminpanel/users/");
      return response.data;
    },
  });

export type ActivityFilters = {
  user?: string;
  action?: string;
  start?: string;
  end?: string;
};

const buildQuery = (filters: ActivityFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
};

export const useAdminActivity = (filters: ActivityFilters) =>
  useQuery({
    queryKey: ["admin", "activity", filters],
    queryFn: async () => {
      const query = buildQuery(filters);
      const url = query ? `/api/adminpanel/activity/?${query}` : "/api/adminpanel/activity/";
      const response = await api.get<PaginatedResponse<ActivityLog>>(url);
      return response.data;
    },
  });

export const useAdminTasks = () =>
  useQuery({
    queryKey: ["admin", "tasks"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Task>>("/api/adminpanel/tasks/");
      return response.data;
    },
  });

export const useAdminDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/adminpanel/tasks/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
    },
  });
};

export const useAdminCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Task> & { owner: number }) =>
      api.post<Task>("/api/adminpanel/tasks/", payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
    },
  });
};
