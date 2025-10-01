import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity.js';
import { User } from '../users/user.entity.js';

export enum TodoPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TodoStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity({ name: 'todos' })
@Index('IDX_todos_status_assignee', ['status', 'assigneeId'])
@Index('IDX_todos_project', ['projectId'])
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text', { nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: TodoPriority, default: TodoPriority.MEDIUM })
  priority!: TodoPriority;

  @Column({ type: 'enum', enum: TodoStatus, default: TodoStatus.PENDING })
  status!: TodoStatus;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate?: Date | null;

  @ManyToOne(() => Project, (project) => project.todos, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  project?: Project | null;

  @Column({ name: 'project_id', nullable: true })
  projectId?: string | null;

  @ManyToOne(() => User, (user) => user.todos, { onDelete: 'CASCADE' })
  assignee!: User;

  @Column({ name: 'assignee_id' })
  assigneeId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
