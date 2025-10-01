import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../users/user.entity.js';
import { ActivityQueryDto } from './dto/activity-query.dto.js';

@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('activity')
export class ActivityController {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepository: Repository<ActivityLog>,
  ) {}

  @Get()
  async findAll(@Query() query: ActivityQueryDto) {
    const { page = 1, limit = 10, actorId, entity, action, startDate, endDate } = query;
    const qb = this.activityRepository.createQueryBuilder('activity');

    if (actorId) {
      qb.andWhere('activity.actorId = :actorId', { actorId });
    }

    if (entity) {
      qb.andWhere('activity.entity ILIKE :entity', { entity: `%${entity}%` });
    }

    if (action) {
      qb.andWhere('activity.action = :action', { action });
    }

    if (startDate) {
      qb.andWhere('activity.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('activity.createdAt <= :endDate', { endDate });
    }

    qb.orderBy('activity.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
    };
  }
}
