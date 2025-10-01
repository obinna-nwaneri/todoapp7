import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('appointment_id').unsigned().nullable().references('appointments.id').onDelete('SET NULL')
      table.string('channel').notNullable()
      table.string('title').notNullable()
      table.text('message').notNullable()
      table.boolean('is_read').notNullable().defaultTo(false)
      table.timestamp('scheduled_for', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
