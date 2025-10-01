export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  todoCount?: number;
}

export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate?: string | null;
  projectId?: string | null;
  assigneeId: string;
  createdAt: string;
  updatedAt: string;
  project?: Project | null;
  assignee?: User;
}

export interface ActivityLog {
  id: string;
  actorId?: string | null;
  entity: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  meta?: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
