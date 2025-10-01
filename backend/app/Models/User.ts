import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, hasMany, HasMany, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import DoctorProfile from 'App/Models/DoctorProfile'
import Appointment from 'App/Models/Appointment'
import MedicalRecord from 'App/Models/MedicalRecord'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public phone: string | null

  @column.date({ serializeAs: 'dateOfBirth' })
  public dateOfBirth: DateTime | null

  @column()
  public gender: string | null

  @column()
  public role: 'patient' | 'doctor' | 'admin'

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: 'isActive' })
  public isActive: boolean

  @column.dateTime({ serializeAs: 'lastLoginAt' })
  public lastLoginAt: DateTime | null

  @hasOne(() => DoctorProfile)
  public doctorProfile: HasOne<typeof DoctorProfile>

  @hasMany(() => Appointment, {
    foreignKey: 'patientId',
  })
  public patientAppointments: HasMany<typeof Appointment>

  @hasMany(() => Appointment, {
    foreignKey: 'doctorId',
  })
  public doctorAppointments: HasMany<typeof Appointment>

  @hasMany(() => MedicalRecord, {
    foreignKey: 'patientId',
  })
  public medicalRecords: HasMany<typeof MedicalRecord>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
