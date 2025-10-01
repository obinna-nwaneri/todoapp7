import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Todo from '#models/todo'
import User from '#models/user'
import { createTodoValidator, priorityEnum, statusEnum, updateTodoValidator } from '#validators/todo'

export default class TodosController {
  private serialize(todo: Todo) {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate ? todo.dueDate.toISODate() : null,
      priority: todo.priority,
      status: todo.status,
      userId: todo.userId,
      createdAt: todo.createdAt.toISO(),
      updatedAt: todo.updatedAt?.toISO(),
    }
  }

  private applyFilters(
    query: ModelQueryBuilderContract<typeof Todo>,
    filters: Record<string, any>
  ) {
    if (filters.status && (statusEnum as readonly string[]).includes(filters.status)) {
      query.where('status', filters.status)
    }

    if (filters.priority && (priorityEnum as readonly string[]).includes(filters.priority)) {
      query.where('priority', filters.priority)
    }
  }

  async index({ auth, request }: HttpContext) {
    const user = await auth.use('api').authenticate()
    const filters = request.qs()

    const query = Todo.query().orderBy('due_date', 'asc')
    this.applyFilters(query, filters)

    const userIdFilter = filters.userId ? Number(filters.userId) : undefined

    if (!user.isAdmin()) {
      query.where('user_id', user.id)
    } else if (userIdFilter && !Number.isNaN(userIdFilter)) {
      query.where('user_id', userIdFilter)
    }

    const todos = await query
    return todos.map((todo) => this.serialize(todo))
  }

  async store({ auth, request, response }: HttpContext) {
    const user = await auth.use('api').authenticate()
    const payload = await createTodoValidator.validate(
      request.only(['title', 'description', 'dueDate', 'priority', 'status', 'userId'])
    )

    let ownerId = user.id
    if (user.isAdmin() && payload.userId) {
      const owner = await User.find(payload.userId)
      if (!owner) {
        return response.badRequest({ message: 'Assigned user not found' })
      }
      ownerId = owner.id
    }

    const todo = await Todo.create({
      title: payload.title,
      description: payload.description ?? null,
      dueDate: payload.dueDate ? DateTime.fromJSDate(payload.dueDate) : null,
      priority: payload.priority ?? 'medium',
      status: payload.status ?? 'pending',
      userId: ownerId,
    })

    return response.created({ todo: this.serialize(todo) })
  }

  async show({ auth, params, response, bouncer }: HttpContext) {
    await auth.use('api').authenticate()
    const todo = await Todo.find(params.id)
    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }

    await bouncer.authorize('manageTodo', todo)
    return this.serialize(todo)
  }

  async update({ auth, params, request, response, bouncer }: HttpContext) {
    const user = await auth.use('api').authenticate()
    const todo = await Todo.find(params.id)
    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }

    await bouncer.authorize('manageTodo', todo)

    const payload = await updateTodoValidator.validate(
      request.only(['title', 'description', 'dueDate', 'priority', 'status', 'userId'])
    )

    if (payload.title !== undefined) todo.title = payload.title
    if (payload.description !== undefined) todo.description = payload.description ?? null
    if (payload.dueDate !== undefined) {
      todo.dueDate = payload.dueDate ? DateTime.fromJSDate(payload.dueDate) : null
    }
    if (payload.priority) todo.priority = payload.priority
    if (payload.status) todo.status = payload.status

    if (payload.userId && user.isAdmin()) {
      const owner = await User.find(payload.userId)
      if (!owner) {
        return response.badRequest({ message: 'Assigned user not found' })
      }
      todo.userId = owner.id
    }

    await todo.save()
    return { todo: this.serialize(todo) }
  }

  async destroy({ auth, params, response, bouncer }: HttpContext) {
    await auth.use('api').authenticate()
    const todo = await Todo.find(params.id)
    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }

    await bouncer.authorize('manageTodo', todo)
    await todo.delete()
    return response.ok({ message: 'Todo deleted successfully' })
  }
}
