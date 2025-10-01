import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class Todo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public description: string

  @column()
  public priority: 'low' | 'medium' | 'high'

  @column()
  public status: 'pending' | 'in-progress' | 'completed'

  @column.date({ columnName: 'due_date' })
  public dueDate: DateTime | null

  @column({ columnName: 'user_id' })
  public userId: number

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
