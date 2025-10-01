import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('status').notNullable().defaultTo('pending')
      table.string('priority').notNullable().defaultTo('medium')
      table.timestamp('due_date', { useTz: true }).nullable()
      table.integer('created_by_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('assigned_to_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('completed_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
