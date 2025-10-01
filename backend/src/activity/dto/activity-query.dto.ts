import { IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';
import { ActivityFilterDto } from './activity-filter.dto.js';

export class ActivityQueryDto extends IntersectionType(PaginationQueryDto, ActivityFilterDto) {}
