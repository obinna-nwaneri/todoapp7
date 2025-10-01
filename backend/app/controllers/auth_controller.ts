import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  private serialize(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISO(),
      updatedAt: user.updatedAt?.toISO(),
    }
  }

  async register({ request, response, auth }: HttpContext) {
    const payload = await registerValidator.validate(
      request.only(['name', 'email', 'password'])
    )

    const existing = await User.findBy('email', payload.email)
    if (existing) {
      return response.badRequest({ message: 'Email already registered' })
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: 'user',
    })

    const token = await auth.use('api').createToken(user, ['*'], {
      name: 'api_token',
      expiresIn: '7 days',
    })

    return response.created({ user: this.serialize(user), token: token.toJSON() })
  }

  async login({ request, response, auth }: HttpContext) {
    const payload = await loginValidator.validate(request.only(['email', 'password']))

    try {
      const user = await User.verifyCredentials(payload.email, payload.password)
      const token = await auth.use('api').createToken(user, ['*'], {
        name: 'api_token',
        expiresIn: '7 days',
      })

      return { user: this.serialize(user), token: token.toJSON() }
    } catch {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('api').authenticate()
    await auth.use('api').invalidateToken()
    return response.ok({ message: 'Logged out successfully' })
  }
}
