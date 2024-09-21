import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateInvitedUserDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name: string;
}
