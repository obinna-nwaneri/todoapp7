import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import Todo from '#models/todo'
import { createTodoValidator } from '#validators/create_todo'
import { updateTodoValidator } from '#validators/update_todo'

const normalizeDate = (value?: Date | null) => {
  if (!value) {
    return null
  }

  return DateTime.fromJSDate(value)
}

export default class TodosController {
  async index({ request, auth }: HttpContext) {
    await auth.authenticate()
    const user = auth.user!
    const { status, priority, assignedToId, createdById, search, dueBefore, dueAfter } = request.qs()

    const todosQuery = Todo.query()
      .preload('assignee')
      .preload('creator')
      .orderBy('due_date', 'asc')

    if (status && typeof status === 'string' && Todo.STATUSES.includes(status as any)) {
      todosQuery.where('status', status)
    }

    if (priority && typeof priority === 'string' && Todo.PRIORITIES.includes(priority as any)) {
      todosQuery.where('priority', priority)
    }

    if (assignedToId && assignedToId !== 'all') {
      if (assignedToId === 'me') {
        todosQuery.where('assigned_to_id', user.id)
      } else if (assignedToId === 'unassigned') {
        todosQuery.whereNull('assigned_to_id')
      } else if (!Number.isNaN(Number(assignedToId))) {
        todosQuery.where('assigned_to_id', Number(assignedToId))
      }
    }

    if (createdById && createdById !== 'all') {
      if (createdById === 'me') {
        todosQuery.where('created_by_id', user.id)
      } else if (!Number.isNaN(Number(createdById))) {
        todosQuery.where('created_by_id', Number(createdById))
      }
    }

    if (search && typeof search === 'string') {
      todosQuery.where((builder) => {
        builder
          .whereILike('title', `%${search}%`)
          .orWhereILike('description', `%${search}%`)
      })
    }

    if (dueBefore && typeof dueBefore === 'string') {
      const parsed = DateTime.fromISO(dueBefore)
      if (parsed.isValid) {
        todosQuery.where('due_date', '<=', parsed.toSQL())
      }
    }

    if (dueAfter && typeof dueAfter === 'string') {
      const parsed = DateTime.fromISO(dueAfter)
      if (parsed.isValid) {
        todosQuery.where('due_date', '>=', parsed.toSQL())
      }
    }

    const todos = await todosQuery

    return todos.map((todo) => todo.serialize())
  }

  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    const user = auth.user!
    const payload = await createTodoValidator.validate(request.all())

    const todo = new Todo()
    todo.title = payload.title
    todo.description = payload.description ?? null
    todo.status = (payload.status ?? 'pending') as typeof Todo.STATUSES[number]
    todo.priority = (payload.priority ?? 'medium') as typeof Todo.PRIORITIES[number]
    todo.dueDate = normalizeDate(payload.dueDate ?? null)
    todo.assignedToId = payload.assignedToId ?? null
    todo.createdById = user.id

    if (todo.status === 'completed') {
      todo.completedAt = DateTime.now()
    }

    await todo.save()
    await todo.load('creator')
    await todo.load('assignee')

    return todo.serialize()
  }

  async show({ params, auth }: HttpContext) {
    await auth.authenticate()

    const todo = await Todo.query()
      .where('id', params.id)
      .preload('creator')
      .preload('assignee')
      .firstOrFail()

    return todo.serialize()
  }

  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    const payload = await updateTodoValidator.validate(request.all())

    const todo = await Todo.findOrFail(params.id)

    if (payload.title !== undefined) {
      todo.title = payload.title
    }

    if (payload.description !== undefined) {
      todo.description = payload.description ?? null
    }

    if (payload.priority !== undefined) {
      todo.priority = payload.priority as typeof Todo.PRIORITIES[number]
    }

    if (payload.status !== undefined) {
      todo.status = payload.status as typeof Todo.STATUSES[number]
    }

    if (payload.dueDate !== undefined) {
      todo.dueDate = normalizeDate(payload.dueDate)
    }

    if (payload.assignedToId !== undefined) {
      todo.assignedToId = payload.assignedToId ?? null
    }

    if (payload.completedAt !== undefined) {
      todo.completedAt = normalizeDate(payload.completedAt)
    }

    if (payload.status !== undefined) {
      if (payload.status === 'completed') {
        if (payload.completedAt === undefined && !todo.completedAt) {
          todo.completedAt = DateTime.now()
        }
      } else if (payload.completedAt === undefined) {
        todo.completedAt = null
      }
    }

    await todo.save()
    await todo.load('creator')
    await todo.load('assignee')

    return todo.serialize()
  }

  async destroy({ params, auth }: HttpContext) {
    await auth.authenticate()
    const todo = await Todo.findOrFail(params.id)
    await todo.delete()

    return { message: 'Todo deleted successfully.' }
  }
}
