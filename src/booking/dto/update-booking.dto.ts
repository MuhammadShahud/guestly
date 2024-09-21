import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsNotEmpty()
  @IsString()
  bookingId: string;
}
