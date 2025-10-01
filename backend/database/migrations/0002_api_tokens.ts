import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ApiTokensSchema extends BaseSchema {
  protected tableName = 'api_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.string('token', 64).notNullable().unique()
      table.string('type').notNullable()
      table.timestamp('expires_at', { useTz: true })
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
