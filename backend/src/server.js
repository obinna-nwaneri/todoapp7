import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSSequelize from '@adminjs/sequelize';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';
import db, { sequelize } from './models/index.js';

dotenv.config();

AdminJS.registerAdapter(AdminJSSequelize);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

const admin = new AdminJS({
  databases: [sequelize],
  rootPath: '/admin',
  resources: [
    {
      resource: db.User,
      options: {
        properties: {
          password: {
            type: 'password',
            isVisible: { list: false, edit: true, show: false, filter: false }
          }
        }
      }
    },
    {
      resource: db.Todo
    }
  ],
  branding: {
    companyName: 'Enterprise Todo Admin'
  }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return { email };
    }
    const user = await db.User.findOne({ where: { email } });
    if (!user || user.role !== 'admin') {
      return null;
    }
    const bcrypt = await import('bcrypt');
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  },
  cookieName: 'adminjs',
  cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'admin-cookie-secret'
});

app.use(admin.options.rootPath, adminRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Enterprise Todo API is running' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

start();
