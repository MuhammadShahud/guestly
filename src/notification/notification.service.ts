import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INotification } from './interfaces/notification.interface';
import { IUser } from 'src/user/interfaces/user.interface';
@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notification: Model<INotification>,
  ) {}

  async findAll(user: IUser) {
    const data = await this.notification.find({
      recieverId: user?._id,
    });

    return { data };
  }

  create() {
    return 'This action adds a new notification';
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
