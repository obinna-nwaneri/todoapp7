import { DateTime } from 'luxon'
import { column, hasMany, beforeSave } from '@adonisjs/lucid/orm'
import Hash from '@adonisjs/core/services/hash'
import Todo from '#app/Models/Todo'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel } from '@adonisjs/lucid/orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: 'fullName' })
  declare fullName: string

  @column({ serializeAs: 'email' })
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: 'admin' | 'user' | 'team_lead'

  @column({ serializeAs: 'isActive' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Todo, { foreignKey: 'userId' })
  declare todos: HasMany<typeof Todo>

  @hasMany(() => Todo, { foreignKey: 'creatorId' })
  declare createdTodos: HasMany<typeof Todo>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
