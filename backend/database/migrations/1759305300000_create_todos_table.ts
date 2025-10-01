import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.date('due_date').nullable()
      table.enum('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium')
      table.enum('status', ['pending', 'in_progress', 'completed']).notNullable().defaultTo('pending')
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
