import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityAction, ActivityLog } from './activity-log.entity.js';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepository: Repository<ActivityLog>,
  ) {}

  async log(options: {
    actorId?: string | null;
    entity: string;
    entityId: string;
    action: ActivityAction;
    meta?: Record<string, unknown>;
  }): Promise<ActivityLog> {
    const log = this.activityRepository.create({
      actorId: options.actorId ?? null,
      entity: options.entity,
      entityId: options.entityId,
      action: options.action,
      meta: options.meta ?? null,
    });
    return this.activityRepository.save(log);
  }
}
