export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'
export type TodoPriority = 'low' | 'medium' | 'high' | 'critical'

export interface UserSummary {
  id: number
  fullName: string | null
  email: string
  isAdmin: boolean
  createdAt?: string
  updatedAt?: string | null
  assignedCount?: number
  createdCount?: number
}

export interface Todo {
  id: number
  title: string
  description: string | null
  status: TodoStatus
  priority: TodoPriority
  dueDate: string | null
  createdById: number
  assignedToId: number | null
  completedAt: string | null
  createdAt: string
  updatedAt: string | null
  creator?: UserSummary
  assignee?: UserSummary | null
}

export interface AuthResponse {
  token: string
  type: string
  abilities: string[]
  expiresAt: string | null
  user: UserSummary
}
