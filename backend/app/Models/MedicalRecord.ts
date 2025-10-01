import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Appointment from 'App/Models/Appointment'

export default class MedicalRecord extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'patientId' })
  public patientId: number

  @column({ serializeAs: 'doctorId' })
  public doctorId: number | null

  @column({ serializeAs: 'appointmentId' })
  public appointmentId: number | null

  @column()
  public summary: string

  @column()
  public prescriptions: string | null

  @column()
  public recommendations: string | null

  @belongsTo(() => User, {
    foreignKey: 'patientId',
  })
  public patient: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'doctorId',
  })
  public doctor: BelongsTo<typeof User>

  @belongsTo(() => Appointment)
  public appointment: BelongsTo<typeof Appointment>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
