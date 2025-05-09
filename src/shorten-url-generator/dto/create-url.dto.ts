import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://example.com',
  })
  @IsString()
  readonly original_url: string;
}
