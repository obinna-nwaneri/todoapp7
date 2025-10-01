import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { TODO_PRIORITIES, TODO_STATUSES, type TodoPriority, type TodoStatus } from '#constants/todo'
import User from '#models/user'

export default class Todo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare status: TodoStatus

  @column()
  declare priority: TodoPriority

  @column.dateTime({ columnName: 'due_date', serializeAs: 'dueDate' })
  declare dueDate: DateTime | null

  @column({ columnName: 'created_by_id', serializeAs: 'createdById' })
  declare createdById: number

  @column({ columnName: 'assigned_to_id', serializeAs: 'assignedToId' })
  declare assignedToId: number | null

  @column.dateTime({ columnName: 'completed_at', serializeAs: 'completedAt' })
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at', serializeAs: 'updatedAt' })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, {
    foreignKey: 'createdById',
  })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'assignedToId',
  })
  declare assignee: BelongsTo<typeof User>

  static STATUSES = TODO_STATUSES
  static PRIORITIES = TODO_PRIORITIES
}
