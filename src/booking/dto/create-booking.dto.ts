import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import moment from 'moment';

export class CreateBookingDto {
  @ApiProperty({
    default: '6695f96dc5ff1d9704fa97b1',
  })
  @IsString()
  @IsNotEmpty()
  mainGuestId: string;

  @IsOptional()
  additionalGuestIds: string[];

  @ApiProperty({
    type: Date,
    default: moment().toDate(),
  })
  @IsNotEmpty()
  @IsDateString()
  checkIn: Date;

  @ApiProperty({
    type: Date,
    default: moment().toDate(),
  })
  @IsNotEmpty()
  @IsDateString()
  checkOut: Date;

  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty({
    default: 7099,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    default: 'STAYONLY',
  })
  @IsString()
  @IsNotEmpty()
  treatment: string;

  @ApiProperty({
    default: 4,
  })
  @IsNotEmpty()
  @IsNumber()
  adults: number;

  @ApiProperty({
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  children: number;

  @IsOptional()
  @IsString()
  roomNo: string;

  @IsOptional()
  @IsString()
  roomCategory: string;

  @IsOptional()
  @IsString()
  marketingSource: string;

  @IsOptional()
  @IsString()
  source: string;

  @IsOptional()
  @IsString()
  bussinessId: string;
}
