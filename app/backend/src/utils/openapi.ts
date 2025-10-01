import { OpenAPIGenerator, extendZodWithOpenApi } from 'zod-to-openapi';
import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
} from '../modules/auth/validators.js';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuery,
} from '../modules/users/validators.js';
import {
  projectBodySchema,
  updateProjectSchema,
  listProjectsQuery,
} from '../modules/projects/validators.js';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuery,
} from '../modules/tasks/validators.js';
import { listAuditQuery } from '../modules/audit/validators.js';

extendZodWithOpenApi(z);

export function buildOpenApiSpec() {
  const generator = new OpenAPIGenerator({
    registerSchema,
    loginSchema,
    createUserSchema,
    updateUserSchema,
    listUsersQuery,
    projectBodySchema,
    updateProjectSchema,
    listProjectsQuery,
    createTaskSchema,
    updateTaskSchema,
    listTasksQuery,
    listAuditQuery,
  }, '3.0.0');

  const document = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Docapp3 API',
      version: '1.0.0',
    },
    servers: [{ url: '/api' }],
  });

  return document;
}
