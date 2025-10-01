import User from '#models/user'
import { signUser } from '#services/jwt_service'
import { serializeUser } from '#serializers/user_serializer'
import { loginValidator, registerValidator } from '#validators/auth'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await registerValidator.validate(request.all())

    const existing = await User.findBy('email', payload.email)
    if (existing) {
      return response.conflict({ message: 'Email is already registered' })
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: 'user',
    })

    const token = signUser(user)

    return response.created({
      message: 'Registration successful',
      token,
      user: serializeUser(user),
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await loginValidator.validate(request.all())

    const user = await User.query().where('email', email).first()

    if (!user) {
      return response.unauthorized({ message: 'Invalid email or password' })
    }

    const isValid = await hash.use('scrypt').verify(user.password, password)

    if (!isValid) {
      return response.unauthorized({ message: 'Invalid email or password' })
    }

    const token = signUser(user)

    return response.ok({
      message: 'Login successful',
      token,
      user: serializeUser(user),
    })
  }

  async logout({ response }: HttpContext) {
    return response.ok({ message: 'Logged out successfully' })
  }
}
