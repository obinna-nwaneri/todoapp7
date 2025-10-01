import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Todo from './Todo.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ columnName: 'full_name' })
  public fullName: string

  @column()
  public role: 'admin' | 'member'

  @hasMany(() => Todo)
  public todos: HasMany<typeof Todo>
}
