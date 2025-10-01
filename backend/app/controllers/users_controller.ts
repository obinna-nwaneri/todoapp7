import Todo from '#models/todo'
import User from '#models/user'
import { serializeUser } from '#serializers/user_serializer'
import { adminUpdateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ response }: HttpContext) {
    const users = await User.query().preload('todos')

    const data = users.map((user) => ({
      ...serializeUser(user),
      stats: {
        totalTodos: user.todos.length,
        completed: user.todos.filter((todo) => todo.status === 'completed').length,
      },
    }))

    return response.ok({ data })
  }

  async update({ params, request, response, bouncer }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await bouncer.with('user').authorize('update', user)

    const payload = await adminUpdateUserValidator.validate(request.all(), {
      meta: { userId: user.id },
    })

    if (payload.email && payload.email !== user.email) {
      const existing = await User.query().where('email', payload.email).whereNot('id', user.id).first()
      if (existing) {
        return response.conflict({ message: 'Email is already taken' })
      }
      user.email = payload.email
    }

    if (payload.name) user.name = payload.name
    if (payload.role) user.role = payload.role
    if (payload.password) user.password = payload.password

    await user.save()

    return response.ok({ message: 'User updated', data: serializeUser(user) })
  }

  async destroy({ params, response, bouncer }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await bouncer.with('user').authorize('delete', user)

    if (user.role === 'admin') {
      const remainingAdmins = await User.query().where('role', 'admin').andWhereNot('id', user.id).count('* as total')
      if (Number(remainingAdmins[0].$extras.total) === 0) {
        return response.badRequest({ message: 'At least one admin must remain' })
      }
    }

    await Todo.query().where('user_id', user.id).delete()
    await user.delete()

    return response.ok({ message: 'User removed' })
  }
}
