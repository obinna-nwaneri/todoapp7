import type { HttpContext } from '@adonisjs/core/http'
import User from '../../Models/User.js'

export default class UsersController {
  public async index() {
    return User.query().preload('todos')
  }

  public async store({ request, response }: HttpContext) {
    const payload = request.only(['email', 'full_name', 'role'])
    const user = await User.create(payload)
    await user.load('todos')
    response.status(201)
    return user
  }
}
