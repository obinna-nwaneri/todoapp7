export default class RoleMiddleware {
  public async handle(ctx: any, next: () => Promise<void>, roles: string[]) {
    await ctx.auth.authenticate()
    const user = ctx.auth.user

    if (!user || !roles.includes(user.role)) {
      return ctx.response.unauthorized({
        message: 'You are not authorized to access this resource',
      })
    }

    await next()
  }
}
