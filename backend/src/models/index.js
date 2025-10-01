import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const modelsDir = path.dirname(new URL(import.meta.url).pathname);
const basename = path.basename(new URL(import.meta.url).pathname);
const db = {};

const {
  PG_HOST = 'localhost',
  PG_PORT = '5432',
  PG_USER = 'postgres',
  PG_PASSWORD = 'admin',
  PG_DB_NAME = 'Docapp3'
} = process.env;

export const sequelize = new Sequelize(PG_DB_NAME, PG_USER, PG_PASSWORD, {
  host: PG_HOST,
  port: PG_PORT,
  dialect: 'postgres',
  logging: false
});

const modelFiles = fs
  .readdirSync(modelsDir)
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js');

for (const file of modelFiles) {
  const module = await import(`./${file}`);
  const model = module.default(sequelize);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
