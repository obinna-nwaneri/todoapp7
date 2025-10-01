import { BaseSchema } from '@adonisjs/lucid/schema'

export default class TodosSchema extends BaseSchema {
  protected tableName = 'todos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('description')
      table.date('due_date')
      table.enu('priority', ['low', 'medium', 'high'], { useNative: true, enumName: 'todo_priority' }).defaultTo('medium')
      table.enu('status', ['pending', 'in_progress', 'completed'], { useNative: true, enumName: 'todo_status' }).defaultTo('pending')
      table.integer('user_id').unsigned().references('users.id').onDelete('SET NULL')
      table.integer('creator_id').unsigned().references('users.id').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS todo_priority')
    this.schema.raw('DROP TYPE IF EXISTS todo_status')
  }
}
