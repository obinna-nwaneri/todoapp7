import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: any, ctx: HttpContext) {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).send({
        message: 'Validation failed',
        errors: error.messages,
      })
    }

    if (error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response.status(404).send({ message: 'Resource not found' })
    }

    if (typeof error.status === 'number') {
      return ctx.response.status(error.status).send({
        message: error.message ?? 'Request failed',
      })
    }

    ctx.logger.error({ err: error }, 'Unhandled exception')
    return ctx.response.status(500).send({ message: 'Internal server error' })
  }
}
