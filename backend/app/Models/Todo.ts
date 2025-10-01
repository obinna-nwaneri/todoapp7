import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from '#app/Models/User'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Todo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column.date()
  declare dueDate: DateTime | null

  @column()
  declare priority: 'low' | 'medium' | 'high'

  @column()
  declare status: 'pending' | 'in_progress' | 'completed'

  @column({ serializeAs: 'userId' })
  declare userId: number | null

  @column({ serializeAs: 'creatorId' })
  declare creatorId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare assignee: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'creatorId' })
  declare creator: BelongsTo<typeof User>
}
