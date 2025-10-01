export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  totalTodos: number
  completed: number
}

export type UserWithStats = User & { stats?: UserStats }

export type TodoPriority = 'low' | 'medium' | 'high'
export type TodoStatus = 'pending' | 'in_progress' | 'completed'

export interface Todo {
  id: number
  title: string
  description: string | null
  dueDate: string | null
  priority: TodoPriority
  status: TodoStatus
  userId: number
  createdAt: string
  updatedAt: string
  user?: User
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface AuthResponse {
  message?: string
  token: string
  user: User
}

export interface ApiMessage {
  message: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

export interface TodoPayload {
  title: string
  description?: string | null
  dueDate?: string | null
  priority?: TodoPriority
  status?: TodoStatus
}

export type UpdateTodoPayload = Partial<TodoPayload>

export type UpdateProfilePayload = Partial<{
  name: string
  email: string
  password: string
}>

export type UpdateUserPayload = UpdateProfilePayload & Partial<{ role: UserRole }>
