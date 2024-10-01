import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduledMessageDto } from './dto/create-scheduled-message.dto';
import { ScheduledMessage } from './interfaces/scheduled-message.interface';
import { UpdateScheduledMessageDto } from './dto/update-scheduled-message.dto';

@Injectable()
export class ScheduledMessageService {
  constructor(
    @InjectModel('ScheduledMessage')
    private scheduledMessageModel: Model<ScheduledMessage>,
  ) {}

  async create(
    createScheduledMessageDto: CreateScheduledMessageDto,
  ): Promise<ScheduledMessage> {
    const createdMessage = new this.scheduledMessageModel(
      createScheduledMessageDto,
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
}
