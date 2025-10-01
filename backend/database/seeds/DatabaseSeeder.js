'use strict'

const InitialSeeder = use('Database/Seeds/InitialSeeder')

class DatabaseSeeder {
  async run () {
    const seeder = new InitialSeeder()
    await seeder.run()
  }
}

module.exports = DatabaseSeeder
