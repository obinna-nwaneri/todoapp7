import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateProfileValidator } from '#validators/user'

export default class ProfileController {
  async show({ auth }: HttpContext) {
    const user = await auth.use('api').authenticate()

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISO(),
      updatedAt: user.updatedAt?.toISO(),
    }
  }

  async update({ auth, request, response }: HttpContext) {
    const user = await auth.use('api').authenticate()
    const payload = await updateProfileValidator.validate(
      request.only(['name', 'email', 'password'])
    )

    if (payload.email && payload.email !== user.email) {
      const existing = await User.query().where('email', payload.email).whereNot('id', user.id).first()
      if (existing) {
        return response.badRequest({ message: 'Email already in use' })
      }
      user.email = payload.email
    }

    if (payload.name !== undefined) {
      user.name = payload.name
    }

    if (payload.password) {
      user.password = payload.password
    }

    await user.save()

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISO(),
      updatedAt: user.updatedAt?.toISO(),
    }
  }
}
