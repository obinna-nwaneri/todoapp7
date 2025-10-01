import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import vine from '@vinejs/vine'
import Todo from '#models/todo'

const createSchema = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3),
    description: vine.string().trim().minLength(3),
    priority: vine.enum(['low', 'medium', 'high']),
    status: vine.enum(['pending', 'in-progress', 'completed']).optional(),
    dueDate: vine
      .date({ formats: ['yyyy-MM-dd'] })
      .optional()
      .nullable(),
  })
)

const updateSchema = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).optional(),
    description: vine.string().trim().minLength(3).optional(),
    priority: vine.enum(['low', 'medium', 'high']).optional(),
    status: vine.enum(['pending', 'in-progress', 'completed']).optional(),
    dueDate: vine
      .date({ formats: ['yyyy-MM-dd'] })
      .optional()
      .nullable(),
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

export default class TodosController {
  public async index({ auth }: HttpContext) {
    const user = await auth.authenticate()
    return Todo.query().where('user_id', user.id).orderBy('created_at', 'desc')
  }

  public async store({ request, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const payload = await vine.validate({ schema: createSchema, data: request.all() })

    const todo = await Todo.create({
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      status: payload.status ?? 'pending',
      dueDate: parseDueDate(payload.dueDate),
      userId: user.id,
    })

    return response.created(todo)
  }

  public async show({ params, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const todo = await Todo.query().where('id', params.id).andWhere('user_id', user.id).first()

    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }

    return todo
  }

  public async update({ params, request, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const payload = await vine.validate({ schema: updateSchema, data: request.all() })

    const todo = await Todo.query().where('id', params.id).andWhere('user_id', user.id).first()
    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
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
    return todo
  }

  public async destroy({ params, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const todo = await Todo.query().where('id', params.id).andWhere('user_id', user.id).first()

    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }

    await todo.delete()
    return response.noContent()
  }
}
