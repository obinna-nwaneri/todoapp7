import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CorsMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (request.method() === 'OPTIONS') {
      response.status(204)
      return
    }

    return next()
  }
}
