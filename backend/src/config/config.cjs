require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

const {
  PG_HOST = 'localhost',
  PG_PORT = '5432',
  PG_USER = 'postgres',
  PG_PASSWORD = 'admin',
  PG_DB_NAME = 'Docapp3'
} = process.env;

const baseConfig = {
  username: PG_USER,
  password: PG_PASSWORD,
  database: PG_DB_NAME,
  host: PG_HOST,
  port: PG_PORT,
  dialect: 'postgres'
};

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig, database: `${PG_DB_NAME}_test` },
  production: { ...baseConfig }
};
