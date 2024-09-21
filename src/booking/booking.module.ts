import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { BookingSchema } from './entities/booking.entity';
import { ContactsModule } from 'src/contacts/contacts.module';
import { ContactsService } from 'src/contacts/contacts.service';

@Module({
  imports: [
    AuthModule,
    ContactsModule,
    MongooseModule.forFeature([{ name: 'Bookings', schema: BookingSchema }]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
