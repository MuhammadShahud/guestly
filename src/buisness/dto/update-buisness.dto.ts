import { PartialType } from '@nestjs/mapped-types';
import { CreateBuisnessDto } from './create-buisness.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBuisnessDto extends PartialType(CreateBuisnessDto) {
  @IsNotEmpty({ message: 'please provide buisness id' })
  @IsString()
  buisnessId: string;

  @IsNotEmpty({ message: 'please provide vat number id' })
  @IsString()
  taxIdNo: string;

  @IsNotEmpty({ message: 'please provide codice' })
  @IsString()
  codice: string;

  @IsNotEmpty({ message: 'please provide phone number ' })
  @IsString()
  phoneNo: string;

  @IsNotEmpty({ message: 'please provide email ' })
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'please provide website ur ' })
  @IsString()
  website: string;
}
