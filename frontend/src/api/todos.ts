import api from './client'
import type { ApiMessage, ApiResponse, Todo, TodoPayload, UpdateTodoPayload } from '../types'

export interface TodoFilters {
  status?: string
  priority?: string
  userId?: number
}

export async function getTodos(filters: TodoFilters = {}) {
  const { data } = await api.get<ApiResponse<Todo[]>>('/todos', { params: filters })
  return data.data
}

export async function getTodo(id: number) {
  const { data } = await api.get<ApiResponse<Todo>>(`/todos/${id}`)
  return data.data
}

export async function createTodo(payload: TodoPayload) {
  const { data } = await api.post<ApiResponse<Todo>>('/todos', payload)
  return data.data
}

export async function updateTodo(id: number, payload: UpdateTodoPayload) {
  const { data } = await api.patch<ApiResponse<Todo>>(`/todos/${id}`, payload)
  return data.data
}

export async function deleteTodo(id: number) {
  const { data } = await api.delete<ApiMessage>(`/todos/${id}`)
  return data
}
