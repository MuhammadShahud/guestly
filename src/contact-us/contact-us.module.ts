import { Module } from '@nestjs/common';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactUsSchema } from './contact-us.entity';
import { SendGridService } from 'src/utils/utils.sendGridService';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ContactUs', schema: ContactUsSchema }]),
  ],
  controllers: [ContactUsController],
  providers: [ContactUsService, SendGridService, ConfigModule],
})
export class ContactUsModule {}
