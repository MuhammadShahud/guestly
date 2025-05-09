import { Module } from '@nestjs/common';
import { ScheduledMessageController } from './scheduled-messages.controller';
import { ScheduledMessageService } from './scheduled-messages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduledMessageSchema } from './scheduled-message.entity';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduledMessagesProcessor } from './scheduled-message.processor';
import { ContactsModule } from 'src/contacts/contacts.module';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'scheduled-messages', // Name of the queue
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6380),
          password: configService.get<string>('REDIS_PASSWORD'), // Optional
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'ScheduledMessage', schema: ScheduledMessageSchema },
    ]),
    ContactsModule,
    BookingModule,
  ],
  controllers: [ScheduledMessageController],
  providers: [ScheduledMessageService, ScheduledMessagesProcessor],
})
export class ScheduledMessagesModule {}
