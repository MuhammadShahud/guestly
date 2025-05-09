import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterMessagesDto {
  @ApiPropertyOptional({
    description: 'ID of the room',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  @IsMongoId()
  room?: string;

  @ApiPropertyOptional({ description: 'Sender identifier', example: 'user1' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Receiver identifier', example: 'user2' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page for pagination',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
