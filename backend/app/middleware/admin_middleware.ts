import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.authUser

    if (!user || user.role !== 'admin') {
      return ctx.response.forbidden({ message: 'Admin access required' })
    }

    return next()
  }
}
