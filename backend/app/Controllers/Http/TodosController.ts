import type { HttpContext } from '@adonisjs/core/http'
import Todo from '#app/Models/Todo'
import { createTodoValidator, updateTodoValidator } from '#app/Validators/TodoValidator'

export default class TodosController {
  public async index({ auth, request }: HttpContext) {
    const status = request.input('status')
    const query = Todo.query().preload('assignee')
    if (status) {
      query.where('status', status)
    }
    if (auth.user?.role !== 'admin') {
      query.where((builder) => {
        builder.where('userId', auth.user!.id).orWhereNull('userId')
      })
    }
    return query.orderBy('created_at', 'desc')
  }

  public async store({ auth, request }: HttpContext) {
    const payload = await request.validateUsing(createTodoValidator)
    const todo = await Todo.create({ ...payload, creatorId: auth.user!.id })
    return todo
  }

  public async show({ params, auth, response }: HttpContext) {
    const todo = await Todo.query().where('id', params.id).preload('assignee').first()
    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }
    if (auth.user?.role !== 'admin' && todo.userId !== auth.user?.id) {
      return response.forbidden({ message: 'Not allowed' })
    }
    return todo
  }

  public async update({ params, request, auth, response }: HttpContext) {
    const todo = await Todo.find(params.id)
    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }
    if (auth.user?.role !== 'admin' && auth.user?.role !== 'team_lead' && todo.userId !== auth.user?.id) {
      return response.forbidden({ message: 'Not allowed' })
    }
    const payload = await request.validateUsing(updateTodoValidator)
    todo.merge(payload)
    await todo.save()
    await todo.load('assignee')
    return todo
  }

  public async destroy({ params, auth, response }: HttpContext) {
    const todo = await Todo.find(params.id)
    if (!todo) {
      return response.notFound({ message: 'Todo not found' })
    }
    if (auth.user?.role !== 'admin' && todo.creatorId !== auth.user?.id) {
      return response.forbidden({ message: 'Not allowed' })
    }
    await todo.delete()
    return { message: 'Todo deleted' }
  }
}
