import { CreateTaskDto } from './create-task.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ default: [] })
  @IsOptional({ message: 'delete media array' })
  deletedMedia?: string[];
}
