import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { Role } from './role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'text' })
  role!: Role;

  @OneToOne(() => Doctor, { nullable: true, eager: true })
  @JoinColumn()
  doctor?: Doctor | null;

  @OneToOne(() => Patient, { nullable: true, eager: true })
  @JoinColumn()
  patient?: Patient | null;
}
