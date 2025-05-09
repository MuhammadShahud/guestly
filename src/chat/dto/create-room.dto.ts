import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsMongoId,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'ID of the business',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsNotEmpty()
  @IsMongoId()
  business: string;

  @ApiProperty({
    description: 'ID of the user',
    example: '60d21b4667d0d8992e610c86',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  user?: string;

  @ApiProperty({
    description: 'ID of the contact',
    example: '60d21b4667d0d8992e610c87',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  contact?: string;

  @ApiProperty({
    description: 'Status of the room',
    example: 'open',
    enum: ['open', 'close'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['open', 'close'])
  status?: string;
}
