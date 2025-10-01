import type { AuthResponse, Todo, TodoPriority, TodoStatus, UserSummary } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api'

interface RequestOptions extends RequestInit {
  token?: string | null
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = 'Request failed'
    try {
      const body = await response.json()
      message = body?.message ?? message
    } catch (error) {
      // ignore json parse errors
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

const request = async <T>(path: string, { token, headers, ...init }: RequestOptions = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  return handleResponse<T>(response)
}

export const login = async (email: string, password: string) =>
  request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const logout = async (token: string) =>
  request<void>('/auth/logout', {
    method: 'POST',
    token,
  })

export const fetchCurrentUser = async (token: string) =>
  request<UserSummary>('/me', {
    method: 'GET',
    token,
  })

export interface TodoFilters {
  status?: TodoStatus | 'all'
  priority?: TodoPriority | 'all'
  assignedToId?: string
  createdById?: string
  search?: string
}

export const fetchTodos = async (token: string, filters: TodoFilters = {}) => {
  const params = new URLSearchParams()

  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status)
  }
  if (filters.priority && filters.priority !== 'all') {
    params.append('priority', filters.priority)
  }
  if (filters.assignedToId && filters.assignedToId !== 'all') {
    params.append('assignedToId', filters.assignedToId)
  }
  if (filters.createdById && filters.createdById !== 'all') {
    params.append('createdById', filters.createdById)
  }
  if (filters.search) {
    params.append('search', filters.search)
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  return request<Todo[]>(`/todos${query}`, {
    method: 'GET',
    token,
  })
}

export interface CreateTodoInput {
  title: string
  description?: string | null
  priority?: TodoPriority
  status?: TodoStatus
  dueDate?: string | null
  assignedToId?: number | null
}

export const createTodo = async (token: string, payload: CreateTodoInput) =>
  request<Todo>('/todos', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })

export interface UpdateTodoInput {
  title?: string
  description?: string | null
  priority?: TodoPriority
  status?: TodoStatus
  dueDate?: string | null
  assignedToId?: number | null
  completedAt?: string | null
}

export const updateTodo = async (token: string, id: number, payload: UpdateTodoInput) =>
  request<Todo>(`/todos/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })

export const deleteTodo = async (token: string, id: number) =>
  request<void>(`/todos/${id}`, {
    method: 'DELETE',
    token,
  })

export const fetchUsers = async (token: string) =>
  request<UserSummary[]>('/users', {
    method: 'GET',
    token,
  })
