import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Address } from 'src/buisness/dto/create-buisness.dto';

export class CreateContactDto {
  @ApiProperty({
    description: 'name',
    default: 'test',
  })
  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'surname',
    default: 'test',
  })
  @IsOptional()
  @IsString()
  surName: string;

  @ApiProperty({
    description: 'phone No',
    default: '55858568568568',
  })
  @IsNotEmpty({ message: 'phoneNo is required' })
  @IsString()
  phoneNo: string;

  @IsOptional()
  @IsString()
  whatsAppId: string;

  @ApiProperty({
    description: 'email',
    default: 'test@yopmail.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: ['en', 'it', 'de'],
    default: 'en',
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'it', 'de'], {
    message: "the value must be on of the following 'en' , 'it' ,'de'",
  })
  language: string;

  @ApiProperty({
    enum: ['male', 'female', 'others'],
    default: 'male',
  })
  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  birthDate: string;

  @IsOptional({ message: 'Please provide complete address!' })
  @Type(() => Address)
  @ValidateNested({ each: true })
  address: Address;

  @ApiProperty({
    default: [
      '667d12795613633c68a4cb12',
      '667d1377fbc01de50e1728b5',
      '667e35ba5f24eb6302a4a79d',
    ],
  })
  @IsOptional()
  @IsArray()
  tags: string[];

  @IsOptional()
  @IsString()
  buisness: string;

  @IsOptional()
  @IsString()
  marketinOptions: string;

  @IsOptional()
  @IsString()
  MarketingOptInDate: string;

  @IsOptional()
  @IsString()
  source: string;
}
