import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditInvitedUserDto {
  @ApiProperty({
    description: '_id of users',
  })
  @IsNotEmpty({ message: 'Please provide userId!' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'new role of the user',
  })
  @IsNotEmpty({ message: 'Please provide role!' })
  @IsString()
  role: string;
}
