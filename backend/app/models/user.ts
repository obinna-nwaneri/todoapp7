import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Todo from '#models/todo'

export type UserRole = 'admin' | 'user'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: UserRole

  @hasMany(() => Todo)
  declare todos: HasMany<typeof Todo>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.use('scrypt').make(user.password)
    }
  }

  static async verifyCredentials(email: string, password: string) {
    const user = await this.query().where('email', email).first()

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValid = await hash.use('scrypt').verify(user.password, password)

    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    return user
  }
}
