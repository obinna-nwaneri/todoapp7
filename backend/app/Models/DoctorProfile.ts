import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import AvailabilitySlot from 'App/Models/AvailabilitySlot'
import Appointment from 'App/Models/Appointment'

export default class DoctorProfile extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public specialty: string

  @column()
  public location: string | null

  @column({ serializeAs: 'yearsExperience' })
  public yearsExperience: number

  @column({ serializeAs: 'consultationFee' })
  public consultationFee: number

  @column()
  public bio: string | null

  @column({ serializeAs: 'consultationModes' })
  public consultationModes: string[]

  @column()
  public services: string[] | null

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => AvailabilitySlot)
  public availabilitySlots: HasMany<typeof AvailabilitySlot>

  @hasMany(() => Appointment)
  public appointments: HasMany<typeof Appointment>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
