// src/pms/pms.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; 
import { PMSService } from './pms.service';
import { PMSController } from './pms.controller';
import { PMS } from './pms.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'pms',schema: PMS }])],
  providers: [PMSService],
  controllers: [PMSController],
  exports: [PMSService],
})
export class PMSModule {}
 