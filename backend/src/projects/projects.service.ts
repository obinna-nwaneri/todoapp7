import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityService } from '../activity/activity.service.js';
import { ActivityAction } from '../activity/activity-log.entity.js';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto.js';
import { User, UserRole } from '../users/user.entity.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { Project } from './project.entity.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly activityService: ActivityService,
  ) {}

  async paginate(
    query: PaginationQueryDto & { q?: string },
    currentUser: User,
  ): Promise<PaginatedResult<Project>> {
    const { page = 1, limit = 10, q } = query;
    const qb = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner');
    qb.loadRelationCountAndMap('project.todoCount', 'project.todos');

    if (currentUser.role !== UserRole.ADMIN) {
      qb.andWhere('project.ownerId = :ownerId', { ownerId: currentUser.id });
    }

    if (q) {
      qb.andWhere('(project.name ILIKE :q OR project.description ILIKE :q)', { q: `%${q}%` });
    }

    qb.orderBy('project.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findById(id: string, currentUser: User): Promise<Project> {
    const project = await this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .loadRelationCountAndMap('project.todoCount', 'project.todos')
      .where('project.id = :id', { id })
      .getOne();
    if (!project) {
      throw new NotFoundException({ message: 'Project not found', code: 'PROJECT_NOT_FOUND' });
    }
    if (currentUser.role !== UserRole.ADMIN && project.ownerId !== currentUser.id) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
    return project;
  }

  async create(dto: CreateProjectDto, currentUser: User): Promise<Project> {
    const ownerId = dto.ownerId ?? currentUser.id;
    if (currentUser.role !== UserRole.ADMIN && ownerId !== currentUser.id) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
    const project = this.projectsRepository.create({
      name: dto.name,
      description: dto.description,
      ownerId,
    });
    const saved = await this.projectsRepository.save(project);
    await this.activityService.log({
      actorId: currentUser.id,
      entity: 'Project',
      entityId: saved.id,
      action: ActivityAction.CREATE,
      meta: dto,
    });
    return saved;
  }

  async update(id: string, dto: UpdateProjectDto, currentUser: User): Promise<Project> {
    const project = await this.findById(id, currentUser);
    if (dto.ownerId && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
    if (dto.name) project.name = dto.name;
    if (dto.description) project.description = dto.description;
    if (dto.ownerId) project.ownerId = dto.ownerId;

    const saved = await this.projectsRepository.save(project);
    await this.activityService.log({
      actorId: currentUser.id,
      entity: 'Project',
      entityId: saved.id,
      action: ActivityAction.UPDATE,
      meta: dto,
    });
    return saved;
  }

  async delete(id: string, currentUser: User): Promise<void> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException({ message: 'Project not found', code: 'PROJECT_NOT_FOUND' });
    }
    if (currentUser.role !== UserRole.ADMIN && project.ownerId !== currentUser.id) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
    await this.projectsRepository.delete(id);
    await this.activityService.log({
      actorId: currentUser.id,
      entity: 'Project',
      entityId: id,
      action: ActivityAction.DELETE,
      meta: {},
    });
  }
}
