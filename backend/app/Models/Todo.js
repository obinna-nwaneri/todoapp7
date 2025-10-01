'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Todo extends Model {
  static get hidden () {
    return []
  }

  assignedUser () {
    return this.belongsTo('App/Models/User', 'assigned_user_id', 'id')
  }

  creator () {
    return this.belongsTo('App/Models/User', 'created_by', 'id')
  }
}

module.exports = Todo
