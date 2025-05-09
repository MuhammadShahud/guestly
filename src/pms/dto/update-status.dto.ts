// src/pms/dto/update-status.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ example: '12345', description: 'The user ID' })
  business: string;

  @ApiProperty({ example: 'active', description: 'The new status' })
  status: string;
}
