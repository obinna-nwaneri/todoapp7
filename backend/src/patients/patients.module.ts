import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Patient]), UsersModule],
  providers: [PatientsService, RolesGuard],
  controllers: [PatientsController],
  exports: [PatientsService],
})
export class PatientsModule {}
