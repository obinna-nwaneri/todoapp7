import api from './client';

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function fetchProjects(params: Record<string, unknown> = {}) {
  const response = await api.get<Paginated<Project>>('/projects', { params });
  return response.data;
}

export async function createProject(payload: {
  name: string;
  description: string;
  ownerId?: string;
}) {
  const response = await api.post<Project>('/projects', payload);
  return response.data;
}
