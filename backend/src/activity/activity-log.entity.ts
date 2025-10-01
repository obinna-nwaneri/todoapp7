import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity.js';

export enum ActivityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
}

@Entity({ name: 'activity_logs' })
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.activityLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  actor?: User | null;

  @Column({ name: 'actor_id', nullable: true })
  actorId?: string | null;

  @Column()
  entity!: string;

  @Column({ name: 'entity_id' })
  entityId!: string;

  @Column()
  action!: ActivityAction;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
