import api from './client';
import type { Paginated } from './projects';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string | null;
  projectId: string;
}

export async function fetchTasks(params: Record<string, unknown> = {}) {
  const response = await api.get<Paginated<Task>>('/tasks', { params });
  return response.data;
}

export async function createTask(payload: {
  projectId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string | null;
  assignedToId?: string | null;
}) {
  const response = await api.post<Task>('/tasks', payload);
  return response.data;
}

export async function updateTask(id: string, payload: Partial<Task>) {
  const response = await api.patch<Task>(`/tasks/${id}`, payload);
  return response.data;
}
