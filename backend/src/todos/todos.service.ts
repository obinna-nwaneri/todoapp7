import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User } from '../users/user.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  findAllForUser(user: User) {
    return this.todosRepository.find({ where: { userId: user.id }, order: { createdAt: 'DESC' } });
  }

  async findOneForUser(id: string, user: User): Promise<Todo> {
    const todo = await this.todosRepository.findOne({ where: { id, userId: user.id } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }

  async create(dto: CreateTodoDto, user: User): Promise<Todo> {
    const todo = this.todosRepository.create({ ...dto, user, userId: user.id });
    return this.todosRepository.save(todo);
  }

  async update(id: string, dto: UpdateTodoDto, user: User): Promise<Todo> {
    const todo = await this.findOneForUser(id, user);
    Object.assign(todo, dto);
    return this.todosRepository.save(todo);
  }

  async remove(id: string, user: User): Promise<void> {
    const todo = await this.findOneForUser(id, user);
    await this.todosRepository.remove(todo);
  }

  async adminFindAll(): Promise<Todo[]> {
    return this.todosRepository.find({ relations: ['user'] });
  }

  async adminRemove(id: string): Promise<void> {
    const todo = await this.todosRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    await this.todosRepository.remove(todo);
  }

  async transferOwnership(id: string, targetUserId: string) {
    const todo = await this.todosRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    todo.userId = targetUserId;
    await this.todosRepository.save(todo);
  }
}
