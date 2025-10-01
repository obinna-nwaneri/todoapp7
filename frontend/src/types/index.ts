export type UserRole = 'admin' | 'team_lead' | 'user'

export interface AuthUser {
  id: number
  full_name: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  message: string
  token: {
    type: string
    token: string
    refreshToken?: string
  }
  user: AuthUser
}

export interface Todo {
  id: number
  title: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  assigned_user_id: number
  created_by: number | null
  created_at: string
  updated_at: string
  assignedUser?: AuthUser
  creator?: AuthUser | null
}

export interface DashboardSummary {
  scope: UserRole | 'admin'
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  activeUsers?: number
}

export interface ApiError {
  message?: string
  errors?: Array<{ field: string; message: string }>
}
