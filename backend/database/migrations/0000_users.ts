import { BaseSchema } from '@adonisjs/lucid/schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('full_name').notNullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.enu('role', ['admin', 'user', 'team_lead'], { useNative: true, enumName: 'user_role' }).defaultTo('user')
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS user_role')
  }
}
