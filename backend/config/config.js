require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const {
  PG_HOST,
  PG_PORT,
  PG_USER,
  PG_PASSWORD,
  PG_DB_NAME,
  NODE_ENV,
} = process.env;

const baseConfig = {
  username: PG_USER || 'postgres',
  password: PG_PASSWORD || 'admin',
  database: PG_DB_NAME || 'Docapp3',
  host: PG_HOST || 'localhost',
  port: PG_PORT ? Number(PG_PORT) : 5432,
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: baseConfig,
  test: { ...baseConfig, database: `${baseConfig.database}_test` },
  production: baseConfig,
};
