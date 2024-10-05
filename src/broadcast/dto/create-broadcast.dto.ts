// src/broadcast/dto/create-broadcast.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  ValidateNested,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BroadcastTemplateDto } from './send-broadcast.dto';
import { BroadcastStatus } from '../enum/broadcast.enum';
import { OneDefaultTemplateValidator } from '../validation/defaultTemplate.validator';
export class CreateBroadcastDto {
  @ApiProperty({
    description: 'List of booking IDs associated with the broadcast',
    example: ['booking1', 'booking2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  bookings: string[];

  @ApiProperty({
    description: 'List of templates used in the broadcast',
    type: [BroadcastTemplateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Validate(OneDefaultTemplateValidator)
  @Type(() => BroadcastTemplateDto)
  templates: BroadcastTemplateDto[];

  @ApiProperty({
    description: 'Business identifier associated with the broadcast',
    example: 'business123',
  })
  @IsString()
  business: string;

  @ApiProperty({
    description: 'Status of the broadcast',
    enum: BroadcastStatus,
    example: BroadcastStatus.PENDING,
  })
  @IsEnum(BroadcastStatus)
  status: BroadcastStatus;

  @ApiProperty({
    description: 'Creation date of the broadcast',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date of the broadcast',
    example: '2023-01-02T00:00:00.000Z',
  })
  @IsDateString()
  updatedAt: Date;
}
