const path = require('path')
const express = require('express')
const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
const AdminJSSequelize = require('@adminjs/sequelize')
const { Sequelize, DataTypes } = require('sequelize')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const { Database, Resource } = AdminJSSequelize
AdminJS.registerAdapter({ Database, Resource })

const connection = new Sequelize(
  process.env.PG_DB_NAME || process.env.DB_DATABASE || 'Docapp3',
  process.env.PG_USER || process.env.DB_USER || 'postgres',
  process.env.PG_PASSWORD || process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.PG_PORT || process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false
  }
)

const User = connection.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'team_lead', 'user'),
    defaultValue: 'user'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

const Todo = connection.define('todos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  due_date: DataTypes.DATE,
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending'
  },
  assigned_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_by: DataTypes.INTEGER,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'todos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

Todo.belongsTo(User, { foreignKey: 'assigned_user_id', as: 'assignedUser' })
Todo.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })
User.hasMany(Todo, { foreignKey: 'assigned_user_id', as: 'todos' })

const admin = new AdminJS({
  rootPath: '/admin',
  databases: [connection],
  branding: {
    companyName: 'Enterprise Todo Admin',
    softwareBrothers: false
  },
  resources: [
    {
      resource: User,
      options: {
        properties: {
          password: { isVisible: false }
        },
        listProperties: ['id', 'full_name', 'email', 'role', 'is_active', 'created_at'],
        editProperties: ['full_name', 'email', 'role', 'is_active'],
        filterProperties: ['role', 'is_active'],
        actions: {
          new: { isAccessible: false },
          delete: { isAccessible: false }
        }
      }
    },
    {
      resource: Todo,
      options: {
        listProperties: ['id', 'title', 'priority', 'status', 'assigned_user_id', 'due_date'],
        editProperties: ['title', 'description', 'priority', 'status', 'assigned_user_id', 'due_date'],
        filterProperties: ['status', 'priority', 'assigned_user_id']
      }
    }
  ]
})

const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email, password) => {
    const adminEmail = process.env.ADMIN_PANEL_EMAIL || 'admin@enterprise.local'
    const adminPassword = process.env.ADMIN_PANEL_PASSWORD || 'Admin123!'
    if (email === adminEmail && password === adminPassword) {
      return { email: adminEmail }
    }
    return null
  },
  cookieName: 'enterprise-todo-admin',
  cookiePassword: process.env.APP_KEY || 'super-secret-key'
})

const app = express()
app.use(admin.options.rootPath, router)

const PORT = process.env.ADMIN_PORT || 3334

connection.authenticate()
  .then(() => {
    console.log('AdminJS connected to PostgreSQL')
    app.listen(PORT, () => {
      console.log(`AdminJS is running at http://localhost:${PORT}${admin.options.rootPath}`)
    })
  })
  .catch((error) => {
    console.error('Unable to connect AdminJS to the database', error)
    process.exit(1)
  })
