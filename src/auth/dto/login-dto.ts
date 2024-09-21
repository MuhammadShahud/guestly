import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  isEmail,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'unique email of the user',
    default: 'test@yopmail.com',
  })
  @IsNotEmpty({ message: 'Please provide email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'password of the user',
    default: '12345678',
  })
  @IsNotEmpty({ message: 'Please provide name' })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'fcm token of the user for push notification optional field',
    default: 'firebasefcmtoken',
  })
  @IsOptional()
  @IsString()
  fcmToken: string;

  @ApiProperty({
    description: 'current language selected on frontend',
    default: 'en',
    enum: ['en', 'lt'],
  })
  @IsOptional()
  @IsString()
  lang: string;
}
