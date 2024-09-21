import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'unique email of the user',
    default: 'test@yopmail.com',
  })
  @IsNotEmpty({ message: 'Please provide email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'current language selected on frontend',
    default: 'en',
    enum: ['en', 'lt'],
  })
  @IsOptional()
  @IsString()
  lang: string;
}
