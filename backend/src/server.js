require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSSequelize = require('@adminjs/sequelize');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const authMiddleware = require('./middleware/auth');
const { sequelize, User, Todo } = require('../models');

AdminJS.registerAdapter({
  Database: AdminJSSequelize.Database,
  Resource: AdminJSSequelize.Resource,
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/todos', authMiddleware, todoRoutes);

const admin = new AdminJS({
  rootPath: '/admin',
  branding: {
    companyName: 'Enterprise Todo',
  },
  resources: [
    {
      resource: User,
      options: {
        properties: {
          password: { isVisible: { list: false, edit: false, filter: false, show: false } },
        },
        actions: {
          new: { isAccessible: false },
        },
      },
    },
    {
      resource: Todo,
    },
  ],
});

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      const adminUser = await User.findOne({ where: { email, isAdmin: true } });
      if (!adminUser) {
        return null;
      }
      const matched = await bcrypt.compare(password, adminUser.password);
      if (matched) {
        return adminUser;
      }
      return null;
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'adminCookieSecret',
  },
  null,
  {
    resave: false,
    saveUninitialized: true,
    secret: process.env.ADMIN_COOKIE_SECRET || 'adminCookieSecret',
  }
);

app.use(admin.options.rootPath, adminRouter);

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

start();

module.exports = app;
