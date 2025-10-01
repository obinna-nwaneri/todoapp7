import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'appointments'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('doctor_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('patient_id').unsigned().references('users.id').onDelete('CASCADE')
      table.timestamp('scheduled_at', { useTz: true }).notNullable()
      table.string('type').notNullable()
      table.string('status').notNullable().defaultTo('pending')
      table.text('reason').nullable()
      table.text('notes').nullable()
      table.boolean('is_paid').notNullable().defaultTo(false)
      table.decimal('fee', 10, 2).notNullable().defaultTo(0)
      table.timestamp('checked_in_at', { useTz: true }).nullable()
      table.timestamp('completed_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
