'use strict'

const UserSeeder = require('./UserSeeder')

class DatabaseSeeder {
  async run () {
    const userSeeder = new UserSeeder()
    await userSeeder.run()
  }
}

module.exports = DatabaseSeeder
