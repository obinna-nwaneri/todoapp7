import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Project } from '../projects/project.entity.js';
import { Todo } from '../todos/todo.entity.js';
import { ActivityLog } from '../activity/activity-log.entity.js';
import { CreateInitialSchema1710000000000 } from './migrations/1710000000000-CreateInitialSchema.js';

const isTest = process.env.NODE_ENV === 'test';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT ?? 5432),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB_NAME,
  entities: [User, Project, Todo, ActivityLog],
  migrations: [CreateInitialSchema1710000000000],
  synchronize: false,
  logging: !isTest,
};

export default new DataSource(dataSourceOptions);
