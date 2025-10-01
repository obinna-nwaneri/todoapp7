import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import DoctorProfile from 'App/Models/DoctorProfile'

export default class AvailabilitySlot extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'doctorProfileId' })
  public doctorProfileId: number

  @column({ serializeAs: 'dayOfWeek' })
  public dayOfWeek: string

  @column({ serializeAs: 'startTime' })
  public startTime: string

  @column({ serializeAs: 'endTime' })
  public endTime: string

  @column({ serializeAs: 'isAvailable' })
  public isAvailable: boolean

  @belongsTo(() => DoctorProfile)
  public doctorProfile: BelongsTo<typeof DoctorProfile>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
