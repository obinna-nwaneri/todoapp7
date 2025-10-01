import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.date('due_date').nullable()
      table
        .enu('priority', ['low', 'medium', 'high'], {
          useNative: true,
          enumName: 'todo_priority',
        })
        .notNullable()
        .defaultTo('medium')
      table
        .enu('status', ['pending', 'in_progress', 'completed'], {
          useNative: true,
          enumName: 'todo_status',
        })
        .notNullable()
        .defaultTo('pending')
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS todo_priority')
    this.schema.raw('DROP TYPE IF EXISTS todo_status')
  }
}
