import { Module } from '@nestjs/common';
import { CampaignController } from './campaigns.controller';
import { CampaignService } from './campaigns.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignSchema } from './campaigns.entity';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CampaignProcessor } from './campaign.processor';
import { ContactsModule } from 'src/contacts/contacts.module';
import { ContactSegmentsModule } from 'src/contact-segments/contact-segments.module';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'campaign', // Name of the queue
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
    MongooseModule.forFeature([{ name: 'Campaign', schema: CampaignSchema }]),
    ContactsModule,
    ContactSegmentsModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignProcessor],
})
export class CampaignsModule {}
