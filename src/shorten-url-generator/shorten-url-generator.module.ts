import { Module } from '@nestjs/common';
import { ShortenUrlGeneratorController } from './shorten-url-generator.controller';
import { ShortenUrlGeneratorService } from './shorten-url-generator.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlSchema } from './shorten-url-genrator.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Url', schema: UrlSchema }])],
  controllers: [ShortenUrlGeneratorController],
  providers: [ShortenUrlGeneratorService],
})
export class ShortenUrlGeneratorModule {}
