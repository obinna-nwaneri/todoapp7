import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'medical_records'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('patient_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('doctor_id').unsigned().references('users.id').onDelete('SET NULL')
      table.integer('appointment_id').unsigned().references('appointments.id').onDelete('SET NULL')
      table.text('summary').notNullable()
      table.text('prescriptions').nullable()
      table.text('recommendations').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
