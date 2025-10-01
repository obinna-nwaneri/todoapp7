import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'doctor_profiles'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.string('specialty').notNullable()
      table.string('location').nullable()
      table.integer('years_experience').notNullable().defaultTo(0)
      table.decimal('consultation_fee', 10, 2).notNullable().defaultTo(0)
      table.text('bio').nullable()
      table.json('consultation_modes').notNullable().defaultTo(JSON.stringify(['physical', 'virtual']))
      table.json('services').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
