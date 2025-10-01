import type { ApiError, AuthResponse, AuthUser, DashboardSummary, Todo } from '../types'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api'

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown, token?: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiError
    const error = new Error(errorBody.message ?? 'Something went wrong')
    ;(error as Error & { details?: ApiError }).details = errorBody
    throw error
  }

  return response.json() as Promise<T>
}

function unwrapCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data
  }

  return []
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', 'POST', { email, password })
}

export async function register(full_name: string, email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', 'POST', { full_name, email, password })
}

export async function fetchProfile(token: string): Promise<AuthUser> {
  return request<AuthUser>('/auth/me', 'GET', undefined, token)
}

export async function fetchDashboard(token: string): Promise<DashboardSummary> {
  return request<DashboardSummary>('/dashboard', 'GET', undefined, token)
}

export async function fetchTodos(token: string): Promise<Todo[]> {
  const data = await request<unknown>('/todos', 'GET', undefined, token)
  return unwrapCollection<Todo>(data)
}

export async function createTodo(token: string, payload: Partial<Todo>): Promise<Todo> {
  return request<Todo>('/todos', 'POST', payload, token)
}

export async function updateTodo(token: string, id: number, payload: Partial<Todo>): Promise<Todo> {
  return request<Todo>(`/todos/${id}`, 'PUT', payload, token)
}

export async function deleteTodo(token: string, id: number): Promise<void> {
  await request(`/todos/${id}`, 'DELETE', undefined, token)
}

export async function fetchUsers(token: string): Promise<AuthUser[]> {
  const data = await request<unknown>('/users', 'GET', undefined, token)
  return unwrapCollection<AuthUser>(data)
}
