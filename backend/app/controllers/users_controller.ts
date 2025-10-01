import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateUserValidator } from '#validators/user'

export default class UsersController {
  private serialize(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISO(),
      updatedAt: user.updatedAt?.toISO(),
      todosCount: Number(user.$extras.todos_count ?? 0),
    }
  }

  async index({ auth, bouncer }: HttpContext) {
    await auth.use('api').authenticate()
    await bouncer.authorize('manageUsers')

    const users = await User.query().withCount('todos').orderBy('name', 'asc')

    return users.map((user) => this.serialize(user))
  }

  async update({ auth, bouncer, params, request, response }: HttpContext) {
    await auth.use('api').authenticate()
    await bouncer.authorize('manageUsers')

    const payload = await updateUserValidator.validate(
      request.only(['name', 'email', 'role', 'password'])
    )
    const user = await User.find(params.id)

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    if (payload.email && payload.email !== user.email) {
      const existing = await User.findBy('email', payload.email)
      if (existing) {
        return response.badRequest({ message: 'Email already in use' })
      }
      user.email = payload.email
    }

    if (payload.name !== undefined) {
      user.name = payload.name
    }

    if (payload.role) {
      user.role = payload.role
    }

    if (payload.password) {
      user.password = payload.password
    }

    await user.save()
    await user.loadCount('todos')

    return { user: this.serialize(user) }
  }
}
