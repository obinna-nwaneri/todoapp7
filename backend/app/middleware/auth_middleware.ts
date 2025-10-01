import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    try {
      await ctx.auth.authenticateUsing(options.guards)
    } catch (error) {
      if (ctx.request.accepts(['json', 'html']) === 'json') {
        return ctx.response.unauthorized({ message: 'Unauthorized' })
      }

      throw error
    }

    return next()
  }
}
