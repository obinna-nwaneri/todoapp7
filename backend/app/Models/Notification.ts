import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Appointment from 'App/Models/Appointment'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'userId' })
  public userId: number

  @column({ serializeAs: 'appointmentId' })
  public appointmentId: number | null

  @column()
  public channel: string

  @column()
  public title: string

  @column()
  public message: string

  @column({ serializeAs: 'isRead' })
  public isRead: boolean

  @column.dateTime({ serializeAs: 'scheduledFor' })
  public scheduledFor: DateTime | null

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Appointment)
  public appointment: BelongsTo<typeof Appointment>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
