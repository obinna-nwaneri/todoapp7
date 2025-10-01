import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'

import SessionToken from 'App/Models/SessionToken'
import User from 'App/Models/User'

export default class TokenAuth {
  public static async authenticate (ctx: HttpContextContract, roles?: Array<User['role']>) {
    const header = ctx.request.header('authorization') || ''
    const [, token] = header.split(' ')

    if (!token) {
      return null
    }

    const session = await SessionToken.query()
      .where('token', token)
      .where('expires_at', '>', DateTime.utc().toSQL())
      .preload('user', (query) => query.preload('doctorProfile'))
      .first()

    if (!session) {
      return null
    }

    if (roles && !roles.includes(session.user.role)) {
      return null
    }

    return session
  }
}
