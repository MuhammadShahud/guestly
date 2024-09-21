import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { comparePassword } from 'src/utils/utils.helper';

export class ChangePasswordDto {
  // @IsOptional({ message: 'Please provide email' })
  // @IsEmail()
  // email: string;

  // @IsNotEmpty({ message: 'Please provide code' })
  // @IsNumber()
  // code: number;

  @IsNotEmpty({ message: 'Please provide password' })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'Please provide password' })
  @Transform(({ obj }) => comparePassword(obj.password, obj.confirmPassword))
  @IsString()
  confirmPassword: string;
}
