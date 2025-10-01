import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ActivityService } from '../activity/activity.service.js';
import { ActivityAction } from '../activity/activity-log.entity.js';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto.js';
import { User, UserRole } from '../users/user.entity.js';
import { Todo, TodoPriority, TodoStatus } from './todo.entity.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { BulkStatusDto } from './dto/bulk-status.dto.js';
import { BulkDeleteDto } from './dto/bulk-delete.dto.js';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
    private readonly activityService: ActivityService,
  ) {}

  async paginate(
    query: PaginationQueryDto & {
      status?: TodoStatus;
      priority?: TodoPriority;
      assigneeId?: string;
      projectId?: string;
      dueBefore?: Date;
      dueAfter?: Date;
      q?: string;
      sort?: 'dueDate' | 'createdAt';
      order?: 'ASC' | 'DESC';
    },
    currentUser: User,
  ): Promise<PaginatedResult<Todo>> {
    const { page = 1, limit = 10 } = query;
    const order = (query.order ?? 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const qb = this.todosRepository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.project', 'project')
      .leftJoinAndSelect('todo.assignee', 'assignee');

    if (currentUser.role !== UserRole.ADMIN) {
      qb.andWhere('todo.assigneeId = :assigneeId', { assigneeId: currentUser.id });
    }

    if (query.status) qb.andWhere('todo.status = :status', { status: query.status });
    if (query.priority) qb.andWhere('todo.priority = :priority', { priority: query.priority });
    if (query.assigneeId) qb.andWhere('todo.assigneeId = :aid', { aid: query.assigneeId });
    if (query.projectId) qb.andWhere('todo.projectId = :pid', { pid: query.projectId });
    if (query.dueBefore) qb.andWhere('todo.dueDate <= :dueBefore', { dueBefore: new Date(query.dueBefore) });
    if (query.dueAfter) qb.andWhere('todo.dueDate >= :dueAfter', { dueAfter: new Date(query.dueAfter) });
    if (query.q) {
      qb.andWhere('(todo.title ILIKE :q OR todo.description ILIKE :q)', { q: `%${query.q}%` });
    }

    const sort = query.sort ?? 'createdAt';
    qb.orderBy(`todo.${sort}`, order);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findById(id: string, currentUser: User): Promise<Todo> {
    const todo = await this.todosRepository.findOne({
      where: { id },
      relations: ['project', 'assignee'],
    });
    if (!todo) {
      throw new NotFoundException({ message: 'Todo not found', code: 'TODO_NOT_FOUND' });
    }
    if (currentUser.role !== UserRole.ADMIN && todo.assigneeId !== currentUser.id) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
    return todo;
  }

  async create(dto: CreateTodoDto, currentUser: User): Promise<Todo> {
    const assigneeId = dto.assigneeId ?? currentUser.id;
    if (currentUser.role !== UserRole.ADMIN && assigneeId !== currentUser.id) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
    const todo = this.todosRepository.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status ?? TodoStatus.PENDING,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      projectId: dto.projectId ?? null,
      assigneeId,
    });
    const saved = await this.todosRepository.save(todo);
    await this.activityService.log({
      actorId: currentUser.id,
      entity: 'Todo',
      entityId: saved.id,
      action: ActivityAction.CREATE,
      meta: dto,
    });
    return saved;
  }

  async update(id: string, dto: UpdateTodoDto, currentUser: User): Promise<Todo> {
    const todo = await this.findById(id, currentUser);
    if (dto.assigneeId && currentUser.role !== UserRole.ADMIN && dto.assigneeId !== currentUser.id) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }

    if (dto.title) todo.title = dto.title;
    if (dto.description !== undefined) todo.description = dto.description;
    if (dto.priority) todo.priority = dto.priority;
    if (dto.status) todo.status = dto.status;
    if (dto.dueDate !== undefined) todo.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.projectId !== undefined) todo.projectId = dto.projectId ?? null;
    if (dto.assigneeId) todo.assigneeId = dto.assigneeId;

    const saved = await this.todosRepository.save(todo);
    await this.activityService.log({
      actorId: currentUser.id,
      entity: 'Todo',
      entityId: saved.id,
      action: ActivityAction.UPDATE,
      meta: dto,
    });
    return saved;
  }

  async delete(id: string, currentUser: User): Promise<void> {
    const todo = await this.findById(id, currentUser);
    await this.todosRepository.delete(todo.id);
    await this.activityService.log({
      actorId: currentUser.id,
      entity: 'Todo',
      entityId: todo.id,
      action: ActivityAction.DELETE,
      meta: {},
    });
  }

  async bulkStatus(dto: BulkStatusDto, currentUser: User) {
    if (currentUser.role !== UserRole.ADMIN) {
      await this.ensureOwnTodos(dto.ids, currentUser);
    }
    await this.todosRepository
      .createQueryBuilder()
      .update(Todo)
      .set({ status: dto.status })
      .whereInIds(dto.ids)
      .execute();
    await this.activityService.log({
      actorId: currentUser.id,
      entity: 'Todo',
      entityId: 'bulk',
      action: ActivityAction.UPDATE,
      meta: { ids: dto.ids, status: dto.status },
    });
    return { message: 'Status updated' };
  }

  async bulkDelete(dto: BulkDeleteDto, currentUser: User) {
    if (currentUser.role !== UserRole.ADMIN) {
      await this.ensureOwnTodos(dto.ids, currentUser);
    }
    await this.todosRepository.delete(dto.ids);
    await this.activityService.log({
      actorId: currentUser.id,
      entity: 'Todo',
      entityId: 'bulk',
      action: ActivityAction.DELETE,
      meta: { ids: dto.ids },
    });
    return { message: 'Todos deleted' };
  }

  private async ensureOwnTodos(ids: string[], user: User) {
    const count = await this.todosRepository.count({
      where: { id: In(ids), assigneeId: user.id },
    });
    if (count !== ids.length) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
  }
}
