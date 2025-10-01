export type UserRole = 'admin' | 'member'

export interface Todo {
  id: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  userId: number
  user?: User
}

export interface User {
  id: number
  email: string
  fullName: string
  role: UserRole
  todos?: Todo[]
}
