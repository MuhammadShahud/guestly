import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
import { AuthDecorator } from 'src/common/decorators/auth-decorater';
import { USER_ROLE } from 'src/auth/enums/enums';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { S3Storage } from 'src/utils/utils.s3';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly s3Storage: S3Storage,
  ) {}

  @SwaggerDecorator('create task', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 1 }]),
  )
  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFiles() attachments: Express.Multer.File[],
  ) {
    const uploadFiles = await this.s3Storage.uploadFiles(attachments);

    if (!!uploadFiles?.attachments)
      createTaskDto.attachment = uploadFiles?.attachments?.map((key) => key);

    return this.tasksService.create(createTaskDto);
  }

  @SwaggerDecorator('get all task for a contact', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Get()
  @ApiQuery({
    name: 'contactId',
    required: true,
  })
  @ApiQuery({
    name: 'assigne',
    required: false,
  })
  @ApiQuery({
    name: 'tags',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  async getTaskByContact(
    @Query('contactId') contactId: string,
    @Query('assigne') assigne?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
  ) {
    return await this.tasksService.getTaskByContact(
      contactId,
      assigne,
      tags,
      search,
    );
  }

  @SwaggerDecorator('get single task', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @SwaggerDecorator('update task', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 1 }]),
  )
  @ApiQuery({
    name: 'taskId',
    required: true,
  })
  @Patch()
  async update(
    @Body() updateTaskDto: UpdateTaskDto,
    @UploadedFiles() attachments: Express.Multer.File[],
    @Query('taskId') id: string,
  ) {
    const uploadFiles = await this.s3Storage.uploadFiles(attachments);
    console.log(updateTaskDto);

    if (!!uploadFiles?.attachments)
      updateTaskDto.attachment = uploadFiles?.attachments?.map((key) => key);

    return await this.tasksService.update(updateTaskDto, id);
  }

  @SwaggerDecorator('delete task', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.tasksService.remove(id);
  }
}
