import { Module } from '@nestjs/common';
import { AppConfigService } from './app-config.service';
import { AppConfigController } from './app-config.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { appConfig } from './app-config.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AppConfig', schema: appConfig }]),
  ],
  controllers: [AppConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
