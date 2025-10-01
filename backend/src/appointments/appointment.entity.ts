import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';

export enum AppointmentStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  doctor!: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  patient!: Patient;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'text' })
  time!: string;

  @Column({
    type: 'text',
    default: AppointmentStatus.Scheduled,
  })
  status!: AppointmentStatus;
}
