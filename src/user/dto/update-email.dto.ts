import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEmailDto {
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
    description: 'password of the user',
    default: '12345678',
  })
  @IsNotEmpty({ message: 'Please provide password!' })
  @IsString()
  password: string;
}
