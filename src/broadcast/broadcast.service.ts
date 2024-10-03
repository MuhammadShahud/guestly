import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { UpdateBroadcastDto } from './dto/update-broadcast.dto';
import { IBroadcast } from './interfaces/broadcast.enum';
import { ConfigService } from '@nestjs/config';
import { ApiService } from 'src/utils/apiServise';
import { TemplateService } from 'src/templates/templates.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { ToolsIntegrationsService } from 'src/tools-integrations/tools-integrations.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class BroadcastService {
  constructor(
    @InjectModel('Broadcast')
    private readonly broadcastModel: Model<IBroadcast>,
    private readonly whatsappService: WhatsappService,
    private readonly templateService: TemplateService,
  ) {}

  async create(createBroadcastDto: CreateBroadcastDto): Promise<IBroadcast> {
    const broadcast = new this.broadcastModel(createBroadcastDto);

    if (broadcast) {
      const template = await this.templateService.findOne(broadcast.business);
      await this.whatsappService.sendBroadCastMessages(broadcast, template);
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
}
