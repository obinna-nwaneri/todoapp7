import Todo from '#models/todo'
import { serializeUser } from '#serializers/user_serializer'
import { createTodoValidator, updateTodoValidator } from '#validators/todo'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

const validStatuses = ['pending', 'in_progress', 'completed']
const validPriorities = ['low', 'medium', 'high']

function serializeTodo(todo: Todo) {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    dueDate: todo.dueDate?.toISODate() ?? null,
    priority: todo.priority,
    status: todo.status,
    userId: todo.userId,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  }
}

export default class TodosController {
  async index({ authUser, request, response }: HttpContext) {
    const status = request.input('status')
    const priority = request.input('priority')

    if (status && !validStatuses.includes(status)) {
      return response.badRequest({ message: 'Invalid status filter' })
    }

    if (priority && !validPriorities.includes(priority)) {
      return response.badRequest({ message: 'Invalid priority filter' })
    }

    const query = Todo.query().orderBy('due_date', 'asc')

    if (authUser?.role !== 'admin') {
      query.where('user_id', authUser!.id)
    } else if (request.input('userId')) {
      query.where('user_id', request.input('userId'))
    }

    if (status) {
      query.where('status', status)
    }

    if (priority) {
      query.where('priority', priority)
    }

    const todos = await query
    return response.ok({ data: todos.map(serializeTodo) })
  }

  async store({ authUser, request, response }: HttpContext) {
    if (!authUser) {
      return response.unauthorized({ message: 'Authentication required' })
    }

    const rawPayload = request.all()
    const payload = await createTodoValidator.validate({
      ...rawPayload,
      dueDate: rawPayload.dueDate === null ? undefined : rawPayload.dueDate,
    })
    let dueDate: DateTime | null = null

    if (typeof payload.dueDate === 'string') {
      const parsed = DateTime.fromISO(payload.dueDate)
      if (!parsed.isValid) {
        return response.badRequest({ message: 'Invalid due date format' })
      }
      dueDate = parsed
    }

    const todo = await Todo.create({
      title: payload.title,
      description: payload.description ?? null,
      dueDate,
      priority: payload.priority ?? 'medium',
      status: payload.status ?? 'pending',
      userId: authUser.id,
    })

    return response.created({ message: 'Todo created', data: serializeTodo(todo) })
  }

  async show({ params, response, bouncer }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    await bouncer.with('todo').authorize('view', todo)
    await todo.load('user')

    return response.ok({ data: { ...serializeTodo(todo), user: serializeUser(todo.user) } })
  }

  async update({ params, request, response, bouncer }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    await bouncer.with('todo').authorize('update', todo)

    const rawPayload = request.all()
    const payload = await updateTodoValidator.validate({
      ...rawPayload,
      dueDate: rawPayload.dueDate === null ? undefined : rawPayload.dueDate,
    })

    if (payload.title) todo.title = payload.title
    if (typeof payload.description !== 'undefined') todo.description = payload.description

    if (rawPayload.dueDate === null) {
      todo.dueDate = null
    } else if (typeof payload.dueDate === 'string') {
      const parsed = DateTime.fromISO(payload.dueDate)
      if (!parsed.isValid) {
        return response.badRequest({ message: 'Invalid due date format' })
      }
      todo.dueDate = parsed
    }

    if (payload.priority) todo.priority = payload.priority
    if (payload.status) todo.status = payload.status

    await todo.save()

    return response.ok({ message: 'Todo updated', data: serializeTodo(todo) })
  }

  async destroy({ params, response, bouncer }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    await bouncer.with('todo').authorize('delete', todo)
    await todo.delete()

    return response.ok({ message: 'Todo deleted' })
  }
}
