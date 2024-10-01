import { Module } from '@nestjs/common';
import { CampaignController } from './campaigns.controller';
import { CampaignService } from './campaigns.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignSchema } from './campaigns.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Campaign', schema: CampaignSchema }]),
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class CampaignsModule {}
