import api from './client'
import type { Todo } from '@/types'

export const fetchTodos = async (params?: { status?: string; priority?: string; userId?: number }) => {
  const { data } = await api.get<Todo[]>('/todos', { params })
  return data
}

export const fetchTodo = async (id: number) => {
  const { data } = await api.get<Todo>(`/todos/${id}`)
  return data
}

type CreateTodoPayload = {
  title: string
  description?: string | null
  dueDate?: string | null
  priority: Todo['priority']
  status: Todo['status']
  userId?: number
}

export const createTodo = async (payload: CreateTodoPayload) => {
  const { data } = await api.post<{ todo: Todo }>('/todos', payload)
  return data.todo
}

export const updateTodo = async (
  id: number,
  payload: Partial<CreateTodoPayload>
) => {
  const { data } = await api.patch<{ todo: Todo }>(`/todos/${id}`, payload)
  return data.todo
}

export const deleteTodo = async (id: number) => {
  await api.delete(`/todos/${id}`)
}
