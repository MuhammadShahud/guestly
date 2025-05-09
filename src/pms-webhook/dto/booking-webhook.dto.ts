import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';

export class AddressDto {
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

export class GuestDto {
  @IsString()
  guest_id: string;

  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsDate()
  @Type(() => Date)
  birthdate: Date;

  @IsEnum(["M","F",'MALE', 'FEMALE', "OTHER"])
  gender: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  language: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class ReservationDto {
  @IsString()
  booking_id: string;

  @IsDate()
  @Type(() => Date)
  booking_date: Date;

  @IsEnum(['CONFIRMED', 'CHECKED-IN', 'CHECKED-OUT', 'CANCELLED', 'BOOKED'])
  booking_status: string;

  @IsNumber()
  booking_price: number;

  @IsString()
  treatment: string;

  @IsDate()
  @Type(() => Date)
  checkin_date: Date;

  @IsDate()
  @Type(() => Date)
  checkout_date: Date;

  @IsNumber()
  adults: number;

  @IsNumber()
  children: number;

  @IsString()
  room_number: string;

  @IsString()
  room_category: string;

  @IsString()
  marketing_source: string;

  @ValidateNested()
  @Type(() => GuestDto)
  booking_owner: GuestDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestDto)
  guests: GuestDto[];
}

export class WebhookPayloadDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationDto)
  reservations: ReservationDto[];
}
