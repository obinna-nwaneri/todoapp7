import { ConfigModule, ConfigService } from '@nestjs/config';
import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Appointment } from './appointments/appointment.entity';
import { Doctor } from './doctors/doctor.entity';
import { Patient } from './patients/patient.entity';
import { User } from './users/user.entity';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.PG_HOST ?? 'localhost',
  port: parseInt(process.env.PG_PORT ?? '5432', 10),
  username: process.env.PG_USER ?? 'postgres',
  password: process.env.PG_PASSWORD ?? 'admin',
  database: process.env.PG_DB_NAME ?? 'Docapp4'
}));

export const dataSourceOptions = {
  type: 'postgres',
  host: databaseConfig().host,
  port: databaseConfig().port,
  username: databaseConfig().username,
  password: databaseConfig().password,
  database: databaseConfig().database,
  entities: [User, Doctor, Patient, Appointment],
  migrations: ['dist/migrations/*.js'],
  synchronize: false
} satisfies DataSourceOptions;

const dataSource = new DataSource({
  ...dataSourceOptions,
  entities: [User, Doctor, Patient, Appointment]
});

export default dataSource;

export const typeOrmAsyncConfig = {
  imports: [ConfigModule.forFeature(databaseConfig)],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.database'),
    autoLoadEntities: true,
    synchronize: false
  })
};
