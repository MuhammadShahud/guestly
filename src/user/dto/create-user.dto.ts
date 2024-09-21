import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { comparePassword } from 'src/utils/utils.helper';

export class CreateUserDto {
  // data from user side
  @ApiProperty({
    description: 'unique email of the user',
    default: 'test@yopmail.com',
  })
  @IsNotEmpty({ message: 'Please provide email!' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'password of the user',
    default: '12345678',
  })
  @IsNotEmpty({ message: 'Please provide password!' })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'confirm password of the user',
    default: '12345678',
  })
  @IsNotEmpty({ message: 'Please provide confirm password!' })
  @Transform(({ obj }) => comparePassword(obj.password, obj.confirmPassword))
  @IsString()
  confirmPassword: string;

  @ApiProperty({
    description: 'name of the of user',
    default: 'test',
  })
  @IsNotEmpty({ message: 'Please provide name!' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  position: string;

  // will be created on server side
  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'current language selected on frontend',
    default: 'en',
    enum: ['en', 'lt'],
  })
  @IsOptional()
  @IsString()
  lang: string;

  @IsOptional()
  @IsString()
  organization: string;

  @IsOptional()
  @IsString()
  cus: string;
}
