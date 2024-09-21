import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { comparePassword } from 'src/utils/utils.helper';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'current password of the user',
    default: '12345678',
  })
  @IsNotEmpty({ message: 'Please provide oldPassword!' })
  @IsString()
  currentPaswword: string;

  @ApiProperty({
    description: 'new password of the user',
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
}
