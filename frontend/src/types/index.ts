export type UserRole = 'admin' | 'user'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt?: string
  updatedAt?: string | null
}

export interface AuthToken {
  type: string
  token?: string
  expiresAt?: string | null
  abilities: string[]
}

export interface Todo {
  id: number
  title: string
  description: string | null
  dueDate: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  userId: number
  createdAt?: string
  updatedAt?: string | null
}

export interface ApiListResponse<T> {
  data: T[]
}
