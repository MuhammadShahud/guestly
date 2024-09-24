import { Module } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { TemplateController } from './templates.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema } from './templates.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Template', schema: TemplateSchema }]),
  ],
  providers: [TemplateService],
  controllers: [TemplateController],
})
export class TemplatesModule {}
