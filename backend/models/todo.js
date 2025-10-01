'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      dueDate: {
        type: DataTypes.DATE,
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
      },
      status: {
        type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
        defaultValue: 'pending',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Todo',
      tableName: 'Todos',
    }
  );
  return Todo;
};
