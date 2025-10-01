'use strict'

const Task = use('App/Models/Task')
const User = use('App/Models/User')
const { validate } = use('Validator')

class TaskController {
  async index ({ request }) {
    const { status, priority, user_id } = request.get()

    const query = Task.query().with('user').orderBy('due_date', 'asc')

    if (status) {
      query.where('status', status)
    }

    if (priority) {
      query.where('priority', priority)
    }

    if (user_id) {
      query.where('user_id', user_id)
    }

    return query.fetch()
  }

  async store ({ request, response }) {
    const payload = request.only(['title', 'description', 'due_date', 'priority', 'status', 'user_id'])

    const validation = await validate(payload, {
      title: 'required',
      description: 'string',
      due_date: 'date',
      priority: 'in:Low,Medium,High',
      status: 'in:Pending,In Progress,Completed',
      user_id: 'required|integer'
    })

    if (validation.fails()) {
      return response.status(422).json({ errors: validation.messages() })
    }

    const user = await User.find(payload.user_id)
    if (!user) {
      return response.status(404).json({ message: 'Assigned user not found.' })
    }

    const task = await Task.create(payload)
    await task.load('user')
    return response.status(201).json(task)
  }

  async show ({ params, response }) {
    const task = await Task.query().where('id', params.id).with('user').first()

    if (!task) {
      return response.status(404).json({ message: 'Task not found.' })
    }

    return task
  }

  async update ({ params, request, response }) {
    const task = await Task.find(params.id)

    if (!task) {
      return response.status(404).json({ message: 'Task not found.' })
    }

    const payload = request.only(['title', 'description', 'due_date', 'priority', 'status', 'user_id'])

    const validation = await validate(payload, {
      title: 'string',
      description: 'string',
      due_date: 'date',
      priority: 'in:Low,Medium,High',
      status: 'in:Pending,In Progress,Completed',
      user_id: 'integer'
    })

    if (validation.fails()) {
      return response.status(422).json({ errors: validation.messages() })
    }

    if (payload.user_id) {
      const user = await User.find(payload.user_id)
      if (!user) {
        return response.status(404).json({ message: 'Assigned user not found.' })
      }
    }

    task.merge(payload)
    await task.save()
    await task.load('user')
    return task
  }

  async destroy ({ params, response }) {
    const task = await Task.find(params.id)

    if (!task) {
      return response.status(404).json({ message: 'Task not found.' })
    }

    await task.delete()
    return response.status(204).send()
  }
}

module.exports = TaskController
