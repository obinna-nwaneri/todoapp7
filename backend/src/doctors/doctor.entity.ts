import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity({ name: 'doctors' })
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.doctorProfile, { eager: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column()
  specialization: string;

  @Column({ type: 'int' })
  yearsOfExperience: number;

  @Column({ type: 'jsonb', nullable: true })
  availabilitySchedule: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
