import { IsArray, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Please provide main permission' })
  @IsString()
  main: string;

  @IsNotEmpty({ message: 'Please provide sub permission' })
  @IsArray()
  sub: string;
}
