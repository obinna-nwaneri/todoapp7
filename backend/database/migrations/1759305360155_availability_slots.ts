import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'availability_slots'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('doctor_profile_id').unsigned().references('doctor_profiles.id').onDelete('CASCADE')
      table.string('day_of_week').notNullable()
      table.time('start_time').notNullable()
      table.time('end_time').notNullable()
      table.boolean('is_available').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
