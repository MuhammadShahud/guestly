import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from './entities/task.entity';
import { AuthModule } from 'src/auth/auth.module';
import { S3Storage } from 'src/utils/utils.s3';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
  ],
  controllers: [TasksController],
  providers: [TasksService, S3Storage],
})
export class TasksModule {}
