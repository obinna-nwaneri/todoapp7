import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Doctor } from './doctors/doctor.entity';
import { Patient } from './patients/patient.entity';
import { Appointment } from './appointments/appointment.entity';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { DatabaseSeedService } from './database/database-seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || 'database.sqlite',
      entities: [Doctor, Patient, Appointment, User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Doctor, Patient, Appointment, User]),
    AuthModule,
    UsersModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
  ],
  providers: [DatabaseSeedService],
})
export class AppModule {}
