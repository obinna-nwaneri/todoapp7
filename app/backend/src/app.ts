import 'express-async-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/routes.js';
import { usersRouter } from './modules/users/routes.js';
import { projectsRouter } from './modules/projects/routes.js';
import { tasksRouter } from './modules/tasks/routes.js';
import { auditRouter } from './modules/audit/routes.js';
import { buildAdminRouter } from './modules/admin/index.js';
import { buildOpenApiSpec } from './utils/openapi.js';

export async function createApp() {
  const app = express();

  app.use(helmet());
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/audit-logs', auditRouter);

  const openapi = buildOpenApiSpec();
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

  const { admin, router } = await buildAdminRouter();
  app.use(admin.options.rootPath, router);

  app.use(errorHandler);

  return app;
}
