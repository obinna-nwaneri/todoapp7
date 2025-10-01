import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsUUID } from 'class-validator';
import { TodoStatus } from '../todo.entity.js';

export class BulkStatusDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids!: string[];

  @ApiProperty({ enum: TodoStatus })
  @IsEnum(TodoStatus)
  status!: TodoStatus;
}
