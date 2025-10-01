import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('email').notNullable().unique()
      table.string('phone').nullable()
      table.date('date_of_birth').nullable()
      table.string('gender').nullable()
      table.string('role').notNullable().index()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.string('password').notNullable()
      table.timestamp('last_login_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
