import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Validate,
  ValidateIf,
  isEmail,
} from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty({ message: 'Please provide name' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Please provide email' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Please provide password' })
  @IsString()
  password: string;
}
