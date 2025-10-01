'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TodosSchema extends Schema {
  up () {
    this.create('todos', (table) => {
      table.increments()
      table.string('title', 150).notNullable()
      table.text('description').nullable()
      table.date('due_date').nullable()
      table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium')
      table.enum('status', ['pending', 'in_progress', 'completed']).defaultTo('pending')
      table
        .integer('assigned_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('created_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamps()
    })
  }

  down () {
    this.drop('todos')
  }
}

module.exports = TodosSchema
