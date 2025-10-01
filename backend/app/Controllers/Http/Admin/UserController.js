'use strict'

const User = use('App/Models/User')
const { validate } = use('Validator')

class UserController {
  async index () {
    const users = await User.query().with('tasks').fetch()
    return users
  }

  async store ({ request, response }) {
    const payload = request.only(['email', 'password', 'role'])

    const validation = await validate(payload, {
      email: 'required|email|unique:users,email',
      password: 'required|min:6',
      role: 'required|in:admin,user'
    })

    if (validation.fails()) {
      return response.status(422).json({ errors: validation.messages() })
    }

    const user = await User.create(payload)
    return response.status(201).json(user)
  }

  async show ({ params, response }) {
    const user = await User.query().where('id', params.id).with('tasks').first()

    if (!user) {
      return response.status(404).json({ message: 'User not found.' })
    }

    return user
  }

  async update ({ params, request, response }) {
    const user = await User.find(params.id)

    if (!user) {
      return response.status(404).json({ message: 'User not found.' })
    }

    const payload = request.only(['email', 'password', 'role'])

    const validation = await validate(payload, {
      email: 'email',
      password: 'min:6',
      role: 'in:admin,user'
    })

    if (validation.fails()) {
      return response.status(422).json({ errors: validation.messages() })
    }

    if (payload.email && payload.email !== user.email) {
      const existing = await User.query()
        .where('email', payload.email)
        .where('id', '!=', user.id)
        .first()
      if (existing) {
        return response.status(422).json({
          errors: [{ field: 'email', message: 'Email already taken.' }]
        })
      }
      user.email = payload.email
    }

    if (payload.password) {
      user.password = payload.password
    }

    if (payload.role) {
      user.role = payload.role
    }

    await user.save()
    await user.load('tasks')
    return user
  }

  async destroy ({ params, response }) {
    const user = await User.find(params.id)

    if (!user) {
      return response.status(404).json({ message: 'User not found.' })
    }

    await user.delete()
    return response.status(204).send()
  }
}

module.exports = UserController
