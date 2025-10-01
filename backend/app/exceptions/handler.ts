import app from '@adonisjs/core/services/app'
import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as vineErrors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction
  protected renderStatusPages = app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(error.status).send({
        message: 'Validation failed',
        errors: error.messages,
      })
    }

    if (authErrors.E_UNAUTHORIZED_ACCESS.isError(error)) {
      return ctx.response.unauthorized({ message: 'Unauthorized' })
    }

    if (authErrors.E_INVALID_CREDENTIALS.isError(error)) {
      return ctx.response.unauthorized({ message: 'Invalid credentials' })
    }

    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
