import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICampaign } from './interfaces/campaign.interface';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel('Campaign') private readonly campaignModel: Model<ICampaign>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<ICampaign> {
    const campaign = new this.campaignModel(createCampaignDto);
    return campaign.save();
  }

  async findAll(
    filters: any,
    page: number,
    limit: number,
  ): Promise<{
    data: ICampaign[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.buildFilters(filters);

    const campaigns = await this.campaignModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.campaignModel.countDocuments(query).exec();

    return {
      data: campaigns,
      total,
      page,
      limit,
    };
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<ICampaign> {
    const updatedCampaign = await this.campaignModel
      .findByIdAndUpdate(
        id,
        { $set: updateCampaignDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return updatedCampaign;
  }

  async findOne(id: string): Promise<ICampaign> {
    const campaign = await this.campaignModel.findById(id).exec();
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async delete(id: string): Promise<ICampaign> {
    const deletedCampaign = await this.campaignModel
      .findOneAndDelete({ _id: id })
      .exec();
    if (!deletedCampaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return deletedCampaign;
  }

  private buildFilters(filters: any) {
    const query: any = {};

    // Name filter with case-insensitive search
    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Business filter
    if (filters.business) {
      query.business = filters.business;
    }

    // Language filter
    if (filters.language) {
      query.language = filters.language;
    }

    // Template filter
    if (filters.template) {
      query.template = filters.template;
    }

    // Contact segment filter
    if (filters.contact_segment) {
      query.contact_segment = filters.contact_segment;
    }

    // Date range filter for createdAt
    if (filters.createdAtFrom || filters.createdAtTo) {
      query.createdAt = {};
      if (filters.createdAtFrom) {
        query.createdAt.$gte = new Date(filters.createdAtFrom);
      }
      if (filters.createdAtTo) {
        query.createdAt.$lte = new Date(filters.createdAtTo);
      }
    }

    // Date range filter for updatedAt
    if (filters.updatedAtFrom || filters.updatedAtTo) {
      query.updatedAt = {};
      if (filters.updatedAtFrom) {
        query.updatedAt.$gte = new Date(filters.updatedAtFrom);
      }
      if (filters.updatedAtTo) {
        query.updatedAt.$lte = new Date(filters.updatedAtTo);
      }
    }

    // Scheduling date and time filters
    if (filters.schedulingDateFrom || filters.schedulingDateTo) {
      query['scheduling.date'] = {};
      if (filters.schedulingDateFrom) {
        query['scheduling.date'].$gte = filters.schedulingDateFrom;
      }
      if (filters.schedulingDateTo) {
        query['scheduling.date'].$lte = filters.schedulingDateTo;
      }
    }

    return query;
  }
}
