import type { HttpContext } from '@adonisjs/core/http'
import User from '#app/Models/User'
import { registerValidator, loginValidator } from '#app/Validators/AuthValidator'

export default class AuthController {
  public async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const user = await User.create({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      role: payload.role ?? 'user',
    })
    return response.created({
      message: 'Registration successful',
      user,
    })
  }

  public async login({ request, auth, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const token = await auth.use('api').attempt(email, password, {
      expiresIn: '7 days',
    })
    return response.ok({
      message: 'Login successful',
      token: token.toJSON(),
    })
  }

  public async me({ auth, response }: HttpContext) {
    await auth.authenticate()
    return response.ok(auth.user)
  }

  public async logout({ auth, response }: HttpContext) {
    await auth.use('api').revoke()
    return response.ok({ message: 'Logged out' })
  }
}
