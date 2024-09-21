import { PartialType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @ApiProperty({
    description: '_id of the tag',
  })
  @IsNotEmpty({ message: 'please provide tagId' })
  @IsString()
  tagId: string;
}
