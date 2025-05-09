import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsMongoId, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRoomDto {
  @ApiPropertyOptional({
    description: 'ID of the business',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  @IsMongoId()
  business?: string;

  @ApiPropertyOptional({
    description: 'Status of the room',
    example: 'open',
    enum: ['open', 'close'],
  })
  @IsOptional()
  @IsEnum(['open', 'close'])
  status?: string;

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
