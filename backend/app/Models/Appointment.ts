import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class Appointment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'doctorId' })
  public doctorId: number

  @column({ serializeAs: 'patientId' })
  public patientId: number

  @column.dateTime({ serializeAs: 'scheduledAt' })
  public scheduledAt: DateTime

  @column()
  public type: 'physical' | 'virtual'

  @column()
  public status: 'pending' | 'confirmed' | 'cancelled' | 'completed'

  @column()
  public reason: string | null

  @column()
  public notes: string | null

  @column({ serializeAs: 'isPaid' })
  public isPaid: boolean

  @column()
  public fee: number

  @column.dateTime({ serializeAs: 'checkedInAt' })
  public checkedInAt: DateTime | null

  @column.dateTime({ serializeAs: 'completedAt' })
  public completedAt: DateTime | null

  @belongsTo(() => User, {
    foreignKey: 'doctorId',
  })
  public doctor: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'patientId',
  })
  public patient: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
