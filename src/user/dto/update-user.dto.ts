import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean({ message: 'feild isVerified should be boolean' })
  @IsOptional()
  isVerified: boolean;

  @IsString({ message: 'feild currentBuisness should be an Id' })
  @IsOptional()
  currentBuisness: boolean;
}
