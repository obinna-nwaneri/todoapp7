import User from '#models/user'
import { verifyToken } from '#services/jwt_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class JwtAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const authorization = ctx.request.header('authorization')

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return ctx.response.unauthorized({ message: 'Missing or invalid Authorization header' })
    }

    const token = authorization.replace(/^Bearer\s+/i, '')

    try {
      const payload = verifyToken(token)
      const user = await User.find(payload.sub)

      if (!user) {
        return ctx.response.unauthorized({ message: 'User no longer exists' })
      }

      ctx.authUser = user
      ctx.authToken = token
      ctx.jwtPayload = payload
    } catch (error) {
      return ctx.response.unauthorized({ message: 'Invalid or expired token' })
    }

    return next()
  }
}
