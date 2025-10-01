import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosService } from './todos.service.js';
import { TodosController } from './todos.controller.js';
import { Todo } from './todo.entity.js';
import { ActivityModule } from '../activity/activity.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Todo]), ActivityModule, ProjectsModule, UsersModule],
  providers: [TodosService],
  controllers: [TodosController],
})
export class TodosModule {}
