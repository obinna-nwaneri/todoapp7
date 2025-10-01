import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'

const registerSchema = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    email: vine.string().trim().email(),
    password: vine.string().minLength(6),
    role: vine.enum(['user', 'admin']).optional(),
  })
)

const loginSchema = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(6),
  })
)

export default class AuthController {
  public async register({ request, response }: HttpContext) {
    const payload = await vine.validate({ schema: registerSchema, data: request.all() })

    const existingUser = await User.findBy('email', payload.email)
    if (existingUser) {
      return response.conflict({ message: 'Email already registered' })
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role ?? 'user',
    })

    return response.created({
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  }

  public async login({ request, auth, response }: HttpContext) {
    const payload = await vine.validate({ schema: loginSchema, data: request.all() })

    try {
      const token = await auth.use('api').attempt(payload.email, payload.password, {
        expiresIn: '7 days',
      })

      const user = auth.user!
      return {
        token: token.toJSON(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }
    } catch {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }
}
