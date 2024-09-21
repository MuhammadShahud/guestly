import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ResetOtpDto {
  @ApiProperty({
    description: 'unique email of the user',
    default: 'test@yopmail.com',
  })
  @IsNotEmpty({ message: 'Please provide email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'type of email',
    default: 'confirmation',
    enum: ['confirmation', 'forgotPassword'],
  })
  @IsNotEmpty({ message: 'Please provide type' })
  @IsIn(['confirmation', 'forgotPassword'], {
    message:
      'only value supported for type is confirmation and forgotPassword  ',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'current language selected on frontend',
    default: 'en',
    enum: ['en', 'lt'],
  })
  @IsOptional()
  @IsString()
  lang: string;
}
