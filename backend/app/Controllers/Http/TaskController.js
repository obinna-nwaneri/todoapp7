'use strict'

const Task = use('App/Models/Task')
const { validate } = use('Validator')
const Database = use('Database')

class TaskController {
  async index ({ request, auth }) {
    const user = await auth.getUser()
    const { status, priority, upcoming } = request.get()

    const query = Task.query()
      .where('user_id', user.id)
      .orderBy('due_date', 'asc')
      .orderBy('created_at', 'desc')

    if (status) {
      query.where('status', status)
    }

    if (priority) {
      query.where('priority', priority)
    }

    if (upcoming) {
      query.where('due_date', '>=', Database.raw('CURRENT_DATE'))
    }

    const tasks = await query.fetch()
    return tasks
  }

  async store ({ request, auth, response }) {
    const user = await auth.getUser()
    const payload = request.only(['title', 'description', 'due_date', 'priority', 'status'])

    const validation = await validate(payload, {
      title: 'required',
      description: 'string',
      due_date: 'date',
      priority: 'in:Low,Medium,High',
      status: 'in:Pending,In Progress,Completed'
    })

    if (validation.fails()) {
      return response.status(422).json({ errors: validation.messages() })
    }

    const task = await Task.create({ ...payload, user_id: user.id })
    await task.load('user')
    return response.status(201).json(task)
  }

  async show ({ params, auth, response }) {
    const user = await auth.getUser()
    const task = await Task.query()
      .where('user_id', user.id)
      .where('id', params.id)
      .first()

    if (!task) {
      return response.status(404).json({ message: 'Task not found.' })
    }

    return task
  }

  async update ({ params, request, auth, response }) {
    const user = await auth.getUser()
    const task = await Task.query()
      .where('user_id', user.id)
      .where('id', params.id)
      .first()

    if (!task) {
      return response.status(404).json({ message: 'Task not found.' })
    }

    const payload = request.only(['title', 'description', 'due_date', 'priority', 'status'])

    const validation = await validate(payload, {
      title: 'string',
      description: 'string',
      due_date: 'date',
      priority: 'in:Low,Medium,High',
      status: 'in:Pending,In Progress,Completed'
    })

    if (validation.fails()) {
      return response.status(422).json({ errors: validation.messages() })
    }

    task.merge(payload)
    await task.save()
    return task
  }

  async destroy ({ params, auth, response }) {
    const user = await auth.getUser()
    const task = await Task.query()
      .where('user_id', user.id)
      .where('id', params.id)
      .first()

    if (!task) {
      return response.status(404).json({ message: 'Task not found.' })
    }

    await task.delete()
    return response.status(204).send()
  }
}

module.exports = TaskController
