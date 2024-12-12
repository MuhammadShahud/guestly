import { Logger, Module } from '@nestjs/common';
import { BroadcastController } from './broadcast.controller';
import { BroadcastService } from './broadcast.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BroadcastSchema } from './broadcast.entity';
import { ApiService } from 'src/utils/apiServise';
import { TemplateService } from 'src/templates/templates.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { ContactsModule } from 'src/contacts/contacts.module';
import { TemplatesModule } from 'src/templates/templates.module';
import { ToolsIntegrationsModule } from 'src/tools-integrations/tools-integrations.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BroadcastProcessor } from './broadcast.processor';
import { BookingModule } from 'src/booking/booking.module';
@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'broadcast', // Name of the queue
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
    AuthModule,
    ContactsModule,
    TemplatesModule,
    ToolsIntegrationsModule,
    MongooseModule.forFeature([{ name: 'Broadcast', schema: BroadcastSchema }]),
    BookingModule,
  ],
  controllers: [BroadcastController],
  providers: [BroadcastService, ApiService, BroadcastProcessor, Logger],
})
export class BroadcastModule {}
