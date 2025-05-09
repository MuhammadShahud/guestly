import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduledMessageDto } from './dto/create-scheduled-message.dto';
import { ScheduledMessage } from './interfaces/scheduled-message.interface';
import { UpdateScheduledMessageDto } from './dto/update-scheduled-message.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ScheduleMessageAction } from './enum/schedule-message.enum';

@Injectable()
export class ScheduledMessageService {
  constructor(
    @InjectModel('ScheduledMessage')
    private scheduledMessageModel: Model<ScheduledMessage>,
    @InjectQueue('scheduled-messages')
    private readonly scheduledMessagesQueue: Queue,
  ) {}

  async create(
    createScheduledMessageDto: CreateScheduledMessageDto,
  ): Promise<ScheduledMessage> {
    const createdMessage = new this.scheduledMessageModel(
      createScheduledMessageDto,
    );

    await this.scheduledMessagesQueue.add(
      'schedule',
      {
        messageID: createdMessage._id,
      },
      {
        attempts: 3,
        delay: 2000,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return createdMessage.save();
  }

  async findAll(filters: any, page: number, limit: number): Promise<any> {
    const query = this.buildFilters(filters);

    const messages = await this.scheduledMessageModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.scheduledMessageModel.countDocuments(query).exec();

    return {
      total,
      page,
      limit,
      data: messages,
    };
  }

  async findOne(id: string): Promise<ScheduledMessage> {
    const message = await this.scheduledMessageModel.findById(id).exec();
    if (!message) {
      throw new NotFoundException(`Scheduled Message with ID ${id} not found`);
    }
    return message;
  }

  async update(
    id: string,
    updateScheduledMessageDto: UpdateScheduledMessageDto,
  ): Promise<ScheduledMessage> {
    const updatedScheduledMessage = await this.scheduledMessageModel
      .findByIdAndUpdate(
        id,
        { $set: updateScheduledMessageDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedScheduledMessage) {
      throw new NotFoundException(`ScheduledMessage with ID ${id} not found`);
    }

    return updatedScheduledMessage;
  }

  async delete(id: string): Promise<ScheduledMessage> {
    const deletedMessage = await this.scheduledMessageModel
      .findOneAndDelete({ _id: id })
      .exec();

    await this.scheduledMessagesQueue.removeJobs(
      deletedMessage.scheduledQueueJobId,
    );

    if (!deletedMessage) {
      throw new NotFoundException(`Scheduled Message with ID ${id} not found`);
    }
    return deletedMessage;
  }

  private buildFilters(filters: any) {
    const query: any = {};
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' }; // Case-insensitive search for name
    }
    if (filters.business) {
      query.business = filters.business;
    }
    if (filters.language) {
      query.language = filters.language;
    }
    return query;
  }

  getHintsForAction(action: ScheduleMessageAction): string {
    switch (action) {
      case ScheduleMessageAction.CHECKIN:
        return 'Choose an action and when to send the message. Day options: {14-1} days before, Day of, {14-1} days after.';
      case ScheduleMessageAction.DURING_STAY:
        return 'Choose an action and when to send the message. Day options: Monday-Sunday.';
      case ScheduleMessageAction.CHECKOUT:
        return 'Choose an action and when to send the message. Day options: {14-1} days before, Day of, {14-1} days after.';
      case ScheduleMessageAction.BIRTHDATE:
        return 'Choose an action and when to send the message. No day option available for birthdate.';
      default:
        return 'Choose an action and when to send the message.';
    }
  }
}
