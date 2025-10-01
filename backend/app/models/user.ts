import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import Todo from '#models/todo'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'full_name' })
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ columnName: 'is_admin' })
  declare isAdmin: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at', serializeAs: 'updatedAt' })
  declare updatedAt: DateTime | null

  @hasMany(() => Todo, {
    foreignKey: 'createdById',
  })
  declare createdTodos: HasMany<typeof Todo>

  @hasMany(() => Todo, {
    foreignKey: 'assignedToId',
  })
  declare assignedTodos: HasMany<typeof Todo>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
