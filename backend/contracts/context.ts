import User from '#models/user'
import type { JwtPayload } from '#services/jwt_service'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    authUser: User | null
    authToken?: string | null
    jwtPayload?: JwtPayload
  }
}
