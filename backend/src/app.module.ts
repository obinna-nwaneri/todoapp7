import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { databaseConfig, typeOrmAsyncConfig } from './typeorm.config';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { SearchModule } from './search/search.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    AuthModule,
    UsersModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    SearchModule
  ]
})
export class AppModule {}
