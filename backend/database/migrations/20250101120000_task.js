'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TaskSchema extends Schema {
  up () {
    this.create('tasks', (table) => {
      table.increments()
      table.string('title').notNullable()
      table.text('description')
      table.date('due_date')
      table.enu('priority', ['Low', 'Medium', 'High']).defaultTo('Low')
      table.enu('status', ['Pending', 'In Progress', 'Completed']).defaultTo('Pending')
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('tasks')
  }
}

module.exports = TaskSchema
