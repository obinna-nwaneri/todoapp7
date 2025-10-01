import type { HttpContext } from '@adonisjs/core/http'

export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    await ctx.auth.check()
    await next()
  }
}
