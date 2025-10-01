'use strict'

const { validate } = use('Validator')
const Todo = use('App/Models/Todo')

const ADMIN_ROLES = ['admin']
const MANAGER_ROLES = ['admin', 'team_lead']

class TodoController {
  async index ({ auth }) {
    const user = await auth.getUser()

    if (ADMIN_ROLES.includes(user.role)) {
      const todos = await Todo.query().with('assignedUser').with('creator').fetch()
      return todos.toJSON()
    }

    if (user.role === 'team_lead') {
      const todos = await Todo.query()
        .where('created_by', user.id)
        .orWhere('assigned_user_id', user.id)
        .with('assignedUser')
        .with('creator')
        .fetch()
      return todos.toJSON()
    }

    const todos = await Todo.query()
      .where('assigned_user_id', user.id)
      .with('assignedUser')
      .with('creator')
      .fetch()

    return todos.toJSON()
  }

  async store ({ request, auth, response }) {
    const user = await auth.getUser()

    const rules = {
      title: 'required',
      description: 'string',
      due_date: 'date',
      priority: 'in:low,medium,high',
      status: 'in:pending,in_progress,completed',
      assigned_user_id: 'required|integer'
    }

    const validation = await validate(request.all(), rules)

    if (validation.fails()) {
      return response.status(422).send({ errors: validation.messages() })
    }

    const payload = request.only([
      'title',
      'description',
      'due_date',
      'priority',
      'status',
      'assigned_user_id'
    ])

    if (payload.assigned_user_id) {
      payload.assigned_user_id = Number(payload.assigned_user_id)
    }

    if (!MANAGER_ROLES.includes(user.role) && payload.assigned_user_id !== user.id) {
      return response.status(403).send({ message: 'You are not allowed to assign tasks to other users.' })
    }

    const todo = await Todo.create({
      ...payload,
      created_by: user.id
    })

    await todo.loadMany(['assignedUser', 'creator'])

    return response.status(201).send(todo)
  }

  async show ({ params, auth, response }) {
    const user = await auth.getUser()
    const todo = await Todo.query().where('id', params.id).with('assignedUser').with('creator').first()

    if (!todo) {
      return response.status(404).send({ message: 'Task not found' })
    }

    if (!this.canAccess(todo, user)) {
      return response.status(403).send({ message: 'You are not allowed to view this task.' })
    }

    return todo
  }

  async update ({ params, request, auth, response }) {
    const user = await auth.getUser()
    const todo = await Todo.find(params.id)

    if (!todo) {
      return response.status(404).send({ message: 'Task not found' })
    }

    if (!this.canModify(todo, user)) {
      return response.status(403).send({ message: 'You are not allowed to update this task.' })
    }

    const rules = {
      title: 'string',
      description: 'string',
      due_date: 'date',
      priority: 'in:low,medium,high',
      status: 'in:pending,in_progress,completed',
      assigned_user_id: 'integer'
    }

    const validation = await validate(request.all(), rules)

    if (validation.fails()) {
      return response.status(422).send({ errors: validation.messages() })
    }

    const payload = request.only(['title', 'description', 'due_date', 'priority', 'status', 'assigned_user_id'])

    if (payload.assigned_user_id) {
      payload.assigned_user_id = Number(payload.assigned_user_id)
    }

    if (
      payload.assigned_user_id &&
      !MANAGER_ROLES.includes(user.role) &&
      payload.assigned_user_id !== user.id
    ) {
      return response.status(403).send({ message: 'You cannot reassign this task.' })
    }

    todo.merge(payload)
    await todo.save()
    await todo.loadMany(['assignedUser', 'creator'])

    return todo
  }

  async destroy ({ params, auth, response }) {
    const user = await auth.getUser()
    const todo = await Todo.find(params.id)

    if (!todo) {
      return response.status(404).send({ message: 'Task not found' })
    }

    if (!this.canModify(todo, user)) {
      return response.status(403).send({ message: 'You are not allowed to delete this task.' })
    }

    await todo.delete()

    return response.status(200).send({ message: 'Task deleted successfully' })
  }

  canAccess (todo, user) {
    if (ADMIN_ROLES.includes(user.role)) {
      return true
    }

    if (user.role === 'team_lead') {
      return todo.created_by === user.id || todo.assigned_user_id === user.id
    }

    return todo.assigned_user_id === user.id
  }

  canModify (todo, user) {
    if (ADMIN_ROLES.includes(user.role)) {
      return true
    }

    if (user.role === 'team_lead') {
      return todo.created_by === user.id || todo.assigned_user_id === user.id
    }

    return todo.assigned_user_id === user.id
  }
}

module.exports = TodoController
