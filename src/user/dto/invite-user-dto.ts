import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class IniteUserDto {
  // data from user side
  @ApiProperty({
    description: 'unique email of the invited user',
    default: 'test@yopmail.com',
  })
  @IsNotEmpty({ message: 'Please provide email!' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'current language selected on frontend',
    default: 'en',
    enum: ['en', 'lt'],
  })
  @IsOptional({ message: 'Please provide lang' })
  @IsString()
  lang: string;

  @ApiProperty({
    description: 'role of the user',
    default: 'admin',
  })
  @IsNotEmpty({ message: 'Please provide role!' })
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  password: string;
}
