import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { Request } from 'express';
import { User } from '../users/user.entity';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findMyTodos(@Req() req: Request) {
    return this.todosService.findAllForUser(req.user as User);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  adminAll() {
    return this.todosService.adminFindAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  adminRemove(@Param('id') id: string) {
    return this.todosService.adminRemove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: Request, @Body() dto: CreateTodoDto) {
    return this.todosService.create(dto, req.user as User);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.todosService.findOneForUser(id, req.user as User);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateTodoDto) {
    return this.todosService.update(id, dto, req.user as User);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.todosService.remove(id, req.user as User);
  }
}
