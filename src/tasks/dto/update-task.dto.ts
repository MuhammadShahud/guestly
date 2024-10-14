import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsNotEmpty({ message: 'Please provide taskId' })
  @IsString()
  taskId: string;

  @IsOptional({ message: 'Please provide taskId' })
  deletedMedia: string[];
}
