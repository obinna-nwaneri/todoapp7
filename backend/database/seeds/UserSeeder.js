'use strict'

const User = use('App/Models/User')

class UserSeeder {
  async run () {
    const users = [
      {
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin'
      },
      {
        email: 'johndoe@example.com',
        password: 'User@123',
        role: 'user'
      }
    ]

    for (const userData of users) {
      const existing = await User.findBy('email', userData.email)
      if (!existing) {
        await User.create(userData)
      }
    }
  }
}

module.exports = UserSeeder
