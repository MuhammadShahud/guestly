import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class Address {
  @IsNotEmpty({ message: 'Please provide street!' })
  @IsString()
  street: string;

  @IsNotEmpty({ message: 'Please provide city!' })
  @IsString()
  city: string;

  @IsNotEmpty({ message: 'Please provide zip!' })
  @IsString()
  zip: string;

  @IsNotEmpty({ message: 'Please provide  country!' })
  @IsString()
  country: string;

  @IsNotEmpty({ message: 'Please provide province!' })
  @IsString()
  province: string;
}

export class CreateBuisnessDto {
  @IsOptional({ message: 'Please provide company name!' })
  @IsString()
  companyName: string;

  @IsOptional({ message: 'Please provide company type!' })
  @IsIn(['', 'hotel', 'B2B', 'apartment', 'resort', 'camping'], {
    message:
      'the provided value is not supported please provide value in :hotel, B2B, apartment, resort, camping',
  })
  companyType: string;

  @IsOptional({ message: 'Please provide company classification!' })
  @IsIn(['', '1-star', '2-stars', '3-stars', '3s-stars', '4-stars', '4s-stars', '5-stars', '5s-stars', 'not-applicable'], {
    message:
      'the provided value is not supported please provide value in : 1-star, 2-stars, 3-stars, 3s-stars, 4-stars, 4s-stars, 5-stars, 5s-stars, not-applicable',
  })
  buisnessClassification: string;

  @IsOptional({ message: 'Please provide company size!' })
  @IsString()
  companySize: string;

  @IsOptional({ message: 'Please provide pms!' })
  @IsString()
  pms: string;

  @IsOptional({ message: 'Please provide complete address!' })
  @Type(() => Address)
  @ValidateNested({ each: true })
  address: Address;

  @IsOptional()
  @IsString()
  organization: string;

  @IsOptional()
  @IsString()
  image: string;
}
