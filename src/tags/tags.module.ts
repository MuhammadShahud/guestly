import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TagSchema } from './tag.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Tags', schema: TagSchema }]),
  ],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
