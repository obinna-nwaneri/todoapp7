import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'

export default class UsersController {
  async index({ auth }: HttpContext) {
    await auth.authenticate()

    const users = await User.query()
      .withCount('assignedTodos', (query) => query.as('assigned_count'))
      .withCount('createdTodos', (query) => query.as('created_count'))
      .orderBy('full_name', 'asc')

    return users.map((user) => ({
      ...user.serialize(),
      assignedCount: Number(user.$extras.assigned_count ?? 0),
      createdCount: Number(user.$extras.created_count ?? 0),
    }))
  }

  async show({ params, auth }: HttpContext) {
    await auth.authenticate()

    const user = await User.query()
      .where('id', params.id)
      .preload('assignedTodos', (todoQuery) => {
        todoQuery.orderBy('due_date', 'asc')
      })
      .preload('createdTodos', (todoQuery) => {
        todoQuery.orderBy('created_at', 'desc')
      })
      .firstOrFail()

    return user.serialize()
  }

  async me({ auth }: HttpContext) {
    await auth.authenticate()
    return auth.user?.serialize()
  }
}
