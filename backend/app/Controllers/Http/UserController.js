'use strict'

const User = use('App/Models/User')

const MANAGER_ROLES = ['admin', 'team_lead']

class UserController {
  async index ({ auth, response }) {
    const user = await auth.getUser()

    if (!MANAGER_ROLES.includes(user.role)) {
      return response.status(403).send({ message: 'Only admins and team leads can view users.' })
    }

    const users = await User.query().select('id', 'full_name', 'email', 'role', 'is_active').fetch()

    return users.toJSON()
  }
}

module.exports = UserController
