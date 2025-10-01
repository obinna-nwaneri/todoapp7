import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class EnsureAuthContextMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (typeof ctx.authUser === 'undefined') {
      ctx.authUser = null
    }
    if (typeof ctx.authToken === 'undefined') {
      ctx.authToken = null
    }
    return next()
  }
}
