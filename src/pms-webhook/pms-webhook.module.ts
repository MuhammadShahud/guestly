import { Module } from '@nestjs/common';
import { PmsWebhookController } from './pms-webhook.controller';
import { PmsWebhookService } from './pms-webhook.service';
import { PMSModule } from 'src/pms/pms.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingSchema } from 'src/booking/entities/booking.entity';
import { contactSchema } from 'src/contacts/entities/contact.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Booking', schema: BookingSchema },
      { name: 'Contacts', schema: contactSchema }, // Make sure to import ContactSchema
    ]),
    PMSModule,
  ],
  controllers: [PmsWebhookController],
  providers: [PmsWebhookService]
})
export class PmsWebhookModule {}
