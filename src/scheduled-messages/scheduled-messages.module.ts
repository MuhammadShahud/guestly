import { Module } from '@nestjs/common';
import { ScheduledMessageController } from './scheduled-messages.controller';
import { ScheduledMessageService } from './scheduled-messages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduledMessageSchema } from './scheduled-message.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ScheduledMessage', schema: ScheduledMessageSchema },
    ]),
  ],
  controllers: [ScheduledMessageController],
  providers: [ScheduledMessageService],
})
export class ScheduledMessagesModule {}
