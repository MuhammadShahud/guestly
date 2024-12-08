// src/pms/dto/create-credentials.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCredentialsDto {
  @ApiProperty({ example: '123123123123123123', description: 'The business' })
  @IsString()
  business: string;
}
