import { handleAdminRequest, adminRootPath } from '#start/admin'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminjsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.request.url().startsWith(adminRootPath)) {
      return next()
    }

    const handled = await handleAdminRequest(
      ctx.request.request,
      ctx.response.response
    )

    if (!handled) {
      return next()
    }
  }
}
