import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

import User from '#models/user'

export default class AuthController {
  async login({ request, response, auth }: HttpContext) {
    const email = request.input('email')
    const password = request.input('password')

    if (!email || !password) {
      return response.badRequest({ message: 'Email and password are required.' })
    }

    const user = await User.query().where('email', email).first()
    if (!user) {
      await hash.use('scrypt').make(password)
      return response.unauthorized({ message: 'Invalid credentials.' })
    }

    const passwordOk = await hash.verify(user.password, password)
    if (!passwordOk) {
      return response.unauthorized({ message: 'Invalid credentials.' })
    }

    const token = await auth.use('api').createToken(user, undefined, {
      expiresIn: '7 days',
      name: 'api-token',
    })
    const tokenPayload = token.toJSON()

    return {
      token: tokenPayload.token,
      type: token.type,
      abilities: token.abilities,
      expiresAt: token.expiresAt ? token.expiresAt.toISOString() : null,
      user: user.serialize(),
    }
  }

  async logout({ auth }: HttpContext) {
    await auth.use('api').invalidateToken()
    return { message: 'Logged out successfully.' }
  }
}
