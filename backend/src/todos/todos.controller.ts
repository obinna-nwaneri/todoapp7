import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { User } from '../users/user.entity.js';
import { TodosService } from './todos.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { BulkStatusDto } from './dto/bulk-status.dto.js';
import { BulkDeleteDto } from './dto/bulk-delete.dto.js';

@ApiTags('todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async list(
    @Query()
    query: PaginationQueryDto & {
      status?: string;
      priority?: string;
      assigneeId?: string;
      projectId?: string;
      dueBefore?: Date;
      dueAfter?: Date;
      q?: string;
      sort?: 'dueDate' | 'createdAt';
      order?: 'ASC' | 'DESC';
    },
    @CurrentUser() user: User,
  ) {
    return this.todosService.paginate(query as any, user);
  }

  @Post()
  async create(@Body() dto: CreateTodoDto, @CurrentUser() user: User) {
    return this.todosService.create(dto, user);
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: User) {
    return this.todosService.findById(id, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
    @CurrentUser() user: User,
  ) {
    return this.todosService.update(id, dto, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.todosService.delete(id, user);
    return { message: 'Todo deleted' };
  }

  @Patch('bulk/status')
  async bulkStatus(@Body() dto: BulkStatusDto, @CurrentUser() user: User) {
    return this.todosService.bulkStatus(dto, user);
  }

  @Delete('bulk')
  async bulkDelete(@Body() dto: BulkDeleteDto, @CurrentUser() user: User) {
    return this.todosService.bulkDelete(dto, user);
  }
}
