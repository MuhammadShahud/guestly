import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ITask } from './interfaces/task.interface';
import mongoose, { Model } from 'mongoose';
import { manageNewAttachment } from 'src/utils/utils.helper';

@Injectable()
export class TasksService {
  constructor(@InjectModel('Task') private readonly Task: Model<ITask>) {}
  async create(createTaskDto: CreateTaskDto) {
    const task = await this.Task.create(createTaskDto);
    return task;
  }

  async getTaskByContact(
    contactId: string,
    assigne: string,
    tags: string,
    search: string,
  ) {
    const dbQuery = {
      contactId,
      ...(!!assigne && { assignedTo: assigne }),
      ...(!!search && { name: { $regex: search, $options: 'i' } }),
      ...(!!tags && {
        tags: tags.split(',').map((e) => new mongoose.Types.ObjectId(e)),
      }),
    };
    const task = await this.Task.find(dbQuery).sort('-createdAt');
    return task;
  }

  async findOne(id: string) {
    const task = await this.Task.findById(id);
    return task;
  }

  async update(updateTaskDto: UpdateTaskDto) {
    const { taskId, deletedMedia, ...rest } = updateTaskDto;

    const task = await this.Task.findById(taskId);

    if (!task) throw new BadRequestException('No task found');

    if (rest.attachment.length > 0 || deletedMedia.length > 0) {
      const newMedia = manageNewAttachment(
        task?.attachment,
        rest.attachment,
        deletedMedia,
      );

      rest.attachment = newMedia;
    }
    const updatedTask = await this.Task.findByIdAndUpdate(taskId, rest, {
      new: true,
    });

    return updatedTask;
  }

  async remove(id: string) {
    const deletedTask = await this.Task.deleteOne({ _id: id });

    return { deletedTask };
  }
}
