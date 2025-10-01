import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './appointments/appointments.module';
import { Appointment } from './appointments/appointment.entity';
import { DoctorsModule } from './doctors/doctors.module';
import { Doctor } from './doctors/doctor.entity';
import { PatientsModule } from './patients/patients.module';
import { Patient } from './patients/patient.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Doctor, Patient, Appointment, User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Doctor, Patient, Appointment]),
    AuthModule,
    UsersModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
