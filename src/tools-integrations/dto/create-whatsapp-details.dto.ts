import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWhatsAppDetailsDto {
  @ApiProperty({
    example: '92342243',
    description: 'the code of the uploaded file on whatsapp',
    default: '12312834',
  })
  @IsOptional()
  @IsString()
  logo: string;

  @ApiProperty({
    example: '+923152517745',
    description: 'the whatsapp number',
    default: '+923152517745',
  })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'Hey there I am using whatsapp',
    description: 'the whatsapp description',
    default: 'Hey there I am using whatsapp',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'C-60,Mushigin',
    description: 'Address',
    default: 'C-60,Mushigin',
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({
    example: 'example.com',
    description: 'the url of webiste',
    default: 'example.com',
  })
  @IsOptional()
  @IsString()
  website: string;

  @ApiProperty({
    example: 'others',
    description: 'the category of whatsapp account',
    default: 'others',
  })
  @IsOptional()
  @IsString()
  category: string;
}
