import axios from 'axios'
import type { Todo, User } from '../types'

const client = axios.create({
  baseURL: '/api',
})

const sampleUsers: User[] = [
  {
    id: 1,
    email: 'admin@enterprise.todo',
    fullName: 'Enterprise Admin',
    role: 'admin',
    todos: [],
  },
  {
    id: 2,
    email: 'jane.doe@enterprise.todo',
    fullName: 'Jane Doe',
    role: 'member',
    todos: [],
  },
  {
    id: 3,
    email: 'john.smith@enterprise.todo',
    fullName: 'John Smith',
    role: 'member',
    todos: [],
  },
]

const sampleTodos: Todo[] = [
  {
    id: 1,
    title: 'Review compliance policies',
    description: 'Ensure quarterly compliance audit tasks are assigned.',
    status: 'in_progress',
    userId: 1,
    user: sampleUsers[0],
  },
  {
    id: 2,
    title: 'Prepare sprint demo',
    description: 'Compile slides and talking points for executive demo.',
    status: 'pending',
    userId: 2,
    user: sampleUsers[1],
  },
  {
    id: 3,
    title: 'Migrate reporting database',
    description: 'Coordinate migration to new analytics cluster.',
    status: 'pending',
    userId: 3,
    user: sampleUsers[2],
  },
  {
    id: 4,
    title: 'Close Jira epic TOD-42',
    description: 'Verify all subtasks are complete and close the epic.',
    status: 'completed',
    userId: 2,
    user: sampleUsers[1],
  },
]

sampleUsers[0].todos = sampleTodos.filter((todo) => todo.userId === 1)
sampleUsers[1].todos = sampleTodos.filter((todo) => todo.userId === 2)
sampleUsers[2].todos = sampleTodos.filter((todo) => todo.userId === 3)

function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await client.get<User[]>('/users')
    return response.data
  } catch (error) {
    if (isNetworkError(error)) {
      return sampleUsers
    }
    throw error
  }
}

export async function getTodos(userId?: number): Promise<Todo[]> {
  try {
    const response = await client.get<Todo[]>('/todos', {
      params: userId ? { userId } : undefined,
    })
    return response.data
  } catch (error) {
    if (isNetworkError(error)) {
      return userId ? sampleTodos.filter((todo) => todo.userId === userId) : sampleTodos
    }
    throw error
  }
}
