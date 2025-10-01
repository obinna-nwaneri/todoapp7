import User from '#models/user'
import { serializeUser } from '#serializers/user_serializer'
import { updateProfileValidator } from '#validators/profile'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ authUser, response }: HttpContext) {
    if (!authUser) {
      return response.unauthorized({ message: 'Authentication required' })
    }

    return response.ok({ data: serializeUser(authUser) })
  }

  async update({ authUser, request, response }: HttpContext) {
    if (!authUser) {
      return response.unauthorized({ message: 'Authentication required' })
    }

    const payload = await updateProfileValidator.validate(request.all(), {
      meta: { userId: authUser.id },
    })

    if (payload.email && payload.email !== authUser.email) {
      const existing = await User.query().where('email', payload.email).whereNot('id', authUser.id).first()
      if (existing) {
        return response.conflict({ message: 'Email is already taken' })
      }
      authUser.email = payload.email
    }

    if (payload.name) authUser.name = payload.name
    if (payload.password) authUser.password = payload.password

    await authUser.save()

    return response.ok({ message: 'Profile updated', data: serializeUser(authUser) })
  }
}
