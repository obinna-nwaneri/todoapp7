import type { HttpContext } from '@adonisjs/core/http'

export default class RoleMiddleware {
  constructor(private roles: string[]) {}

  async handle(ctx: HttpContext, next: () => Promise<void>, roles?: string[]) {
    const allowed = roles || this.roles
    await ctx.auth.authenticate()
    const user = ctx.auth.user!
    if (!allowed.includes(user.role)) {
      ctx.response.abort({ message: 'Forbidden' }, 403)
      return
    }
    await next()
  }
}
