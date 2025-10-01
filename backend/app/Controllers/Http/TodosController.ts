import type { HttpContext } from '@adonisjs/core/http'
import Todo from '../../Models/Todo.js'

export default class TodosController {
  public async index({ request }: HttpContext) {
    const userId = request.input('userId')
    const query = Todo.query().preload('user')

    if (userId) {
      query.where('user_id', userId)
    }

    return query
  }

  public async show({ params }: HttpContext) {
    return Todo.query().where('id', params.id).preload('user').firstOrFail()
  }

  public async store({ request, response }: HttpContext) {
    const payload = request.only(['title', 'description', 'status', 'user_id'])
    const todo = await Todo.create(payload)
    await todo.load('user')
    response.status(201)
    return todo
  }

  public async update({ params, request }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    const payload = request.only(['title', 'description', 'status'])
    todo.merge(payload)
    await todo.save()
    await todo.load('user')
    return todo
  }

  public async destroy({ params, response }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    await todo.delete()
    response.status(204)
  }
}
