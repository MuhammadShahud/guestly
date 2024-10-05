import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { UpdateBroadcastDto } from './dto/update-broadcast.dto';
import { IBroadcast } from './interfaces/broadcast.interface';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { BookingService } from 'src/booking/booking.service';

@Injectable()
export class BroadcastService implements OnModuleInit {
  constructor(
    @InjectModel('Broadcast')
    private readonly broadcastModel: Model<IBroadcast>,
    private readonly bookingService: BookingService,

    @InjectQueue('broadcast') private readonly broadcastQueue: Queue,
  ) {}

  private readonly logger = new Logger();

  async create(createBroadcastDto: CreateBroadcastDto): Promise<IBroadcast> {
    const broadcast = new this.broadcastModel(createBroadcastDto);

    const bookings = await this.bookingService.getBookingsByFilter({
      _id: { $in: broadcast.bookings },
    });

    const contacts = bookings.map((a) => a.mainGuest);

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      const template = broadcast.templates.find(
        (t) => t.language == contact.language,
      );

      const default_template = broadcast.templates.find(
        (t) => t.is_default == true,
      );

      console.log(template, default_template);

      await this.broadcastQueue.add(
        'send',
        {
          contact: contact._id,
          template: template ? template : default_template,
          business: broadcast.business,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    return broadcast.save();
  }

  async findAll(
    filters: any,
    page: number,
    limit: number,
  ): Promise<{
    data: IBroadcast[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.buildFilters(filters);

    const broadcasts = await this.broadcastModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.broadcastModel.countDocuments(query).exec();

    return {
      data: broadcasts,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<IBroadcast> {
    const broadcast = await this.broadcastModel.findById(id).exec();
    if (!broadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found`);
    }
    return broadcast;
  }

  async update(
    id: string,
    updateBroadcastDto: UpdateBroadcastDto,
  ): Promise<IBroadcast> {
    const updatedBroadcast = await this.broadcastModel
      .findByIdAndUpdate(
        id,
        { $set: updateBroadcastDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedBroadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found`);
    }

    return updatedBroadcast;
  }

  async delete(id: string): Promise<IBroadcast> {
    const deletedBroadcast = await this.broadcastModel
      .findOneAndDelete({ _id: id })
      .exec();
    if (!deletedBroadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found`);
    }
    return deletedBroadcast;
  }

  async boradcastToWhatsApp(dto: CreateBroadcastDto): Promise<any> {}

  private buildFilters(filters: any) {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.language) {
      query.language = filters.language;
    }
    if (filters.business) {
      query.business = filters.business;
    }
    return query;
  }

  async onModuleInit() {
    this.broadcastQueue.on('completed', (job: Job) => {
      this.logger.log(`Job ${job.id} completed successfully.`);
    });

    this.broadcastQueue.on('failed', (job: Job, err: Error) => {
      this.logger.error(`Job ${job.id} failed with error: ${err.message}`);
    });

    this.broadcastQueue.on('active', (job: Job) => {
      this.logger.log(`Job ${job.id} is now active.`);
    });
  }
}
