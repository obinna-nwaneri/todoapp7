import type { HttpContext } from '@adonisjs/core/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    await ctx.auth.authenticate()
    await next()
  }
}
