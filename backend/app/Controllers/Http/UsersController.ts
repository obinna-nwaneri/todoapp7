import type { HttpContext } from '@adonisjs/core/http'
import User from '#app/Models/User'
import { createUserValidator, updateUserValidator } from '#app/Validators/UserValidator'

export default class UsersController {
  public async index({ request }: HttpContext) {
    const role = request.input('role')
    const query = User.query().select(['id', 'fullName', 'email', 'role', 'isActive'])
    if (role) {
      query.where('role', role)
    }
    return query.orderBy('created_at', 'desc')
  }

  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await User.create(payload)
    return response.created(user)
  }

  public async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    return user
  }

  public async update({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    const payload = await request.validateUsing(updateUserValidator)
    user.merge(payload)
    await user.save()
    return user
  }

  public async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    await user.delete()
    return { message: 'User deleted' }
  }

  public async activate({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    user.isActive = true
    await user.save()
    return { message: 'User activated' }
  }

  public async deactivate({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    user.isActive = false
    await user.save()
    return { message: 'User deactivated' }
  }
}
