import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class ConfirmLoginDto {
  @ApiProperty({
    description: 'unique email of the user',
    default: 'test@yopmail.com',
  })
  @IsNotEmpty({ message: 'Please provide email' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Please provide OTP' })
  @IsNumber()
  code: number;
}
