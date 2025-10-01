import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  specialization!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments!: Appointment[];
}
