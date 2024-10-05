import { forwardRef, Module } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { TemplateController } from './templates.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema } from './templates.entity';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Template', schema: TemplateSchema }]),
    forwardRef(() => WhatsappModule),
  ],
  providers: [TemplateService],
  controllers: [TemplateController],
  exports: [TemplateService],
})
export class TemplatesModule {}
