import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Todos extends BaseSchema {
  protected tableName = 'todos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium').notNullable()
      table.enum('status', ['pending', 'in-progress', 'completed']).defaultTo('pending').notNullable()
      table.date('due_date').nullable()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
