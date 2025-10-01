import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import vine from '@vinejs/vine'
import User from '#models/user'
import Todo from '#models/todo'

const adminTodoUpdateSchema = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).optional(),
    description: vine.string().trim().minLength(3).optional(),
    priority: vine.enum(['low', 'medium', 'high']).optional(),
    status: vine.enum(['pending', 'in-progress', 'completed']).optional(),
    dueDate: vine.date({ formats: ['yyyy-MM-dd'] }).optional().nullable(),
    userId: vine.number().positive().optional(),
  })
)

function parseDueDate(value: unknown): DateTime | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return DateTime.fromJSDate(value)
  }

  if (typeof value === 'string') {
    const parsed = DateTime.fromISO(value)
    return parsed.isValid ? parsed : null
  }

  return null
}

export default class AdminController {
  public async users({}: HttpContext) {
    return User.query().select('id', 'name', 'email', 'role', 'created_at')
  }

  public async todos({}: HttpContext) {
    return Todo.query().preload('user', (query) => {
      query.select('id', 'name', 'email', 'role')
    })
  }

  public async updateTodo({ params, request, response }: HttpContext) {
    const payload = await vine.validate({ schema: adminTodoUpdateSchema, data: request.all() })
    const todo = await Todo.find(params.id)

    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }

    if (payload.userId) {
      todo.userId = payload.userId
    }

    if (payload.dueDate !== undefined) {
      todo.dueDate = parseDueDate(payload.dueDate)
    }

    todo.merge({
      title: payload.title ?? todo.title,
      description: payload.description ?? todo.description,
      priority: payload.priority ?? todo.priority,
      status: payload.status ?? todo.status,
    })

    await todo.save()
    await todo.load('user')
    return todo
  }

  public async deleteTodo({ params, response }: HttpContext) {
    const todo = await Todo.find(params.id)
    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }

    await todo.delete()
    return response.noContent()
  }
}
