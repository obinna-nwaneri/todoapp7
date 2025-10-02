import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity({ name: 'patients' })
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.patientProfile, { eager: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'int' })
  age: number;

  @Column()
  gender: string;

  @Column()
  contactInfo: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
