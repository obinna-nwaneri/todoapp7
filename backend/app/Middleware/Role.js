'use strict'

class Role {
  async handle ({ auth, response }, next, properties) {
    const allowedRoles = properties
    const user = await auth.getUser()

    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      return response.status(403).json({
        message: 'You are not authorized to perform this action.'
      })
    }

    await next()
  }
}

module.exports = Role
