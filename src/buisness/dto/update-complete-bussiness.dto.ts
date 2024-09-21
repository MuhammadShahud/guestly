import { PartialType } from '@nestjs/mapped-types';
import { CreateBuisnessDto } from './create-buisness.dto';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateCompleteBussinessDto extends PartialType(CreateBuisnessDto) {
  @IsOptional()
  @IsString()
  buisnessId: string;

  @IsOptional()
  @IsString()
  taxIdNo: string;

  @IsOptional()
  @IsString()
  codice: string;

  @IsOptional()
  @IsString()
  phoneNo: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  website: string;
}
