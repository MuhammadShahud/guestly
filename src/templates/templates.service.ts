import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITemplate } from './interfaces/template.interface';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel('Template') private readonly templateModel: Model<ITemplate>,
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<ITemplate> {
    const createdTemplate = new this.templateModel(createTemplateDto);
    return createdTemplate.save();
  }

  async findAll(
    filters: any,
    page: number,
    limit: number,
  ): Promise<{
    data: ITemplate[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.buildFilters(filters);

    const templates = await this.templateModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.templateModel.countDocuments(query).exec();

    return {
      data: templates,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ITemplate> {
    const template = await this.templateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<ITemplate> {
    const existingTemplate = await this.templateModel
      .findByIdAndUpdate(id, updateTemplateDto, { new: true })
      .exec();

    if (!existingTemplate) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return existingTemplate;
  }

  async remove(id: string): Promise<ITemplate> {
    const deletedTemplate = await this.templateModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedTemplate) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return deletedTemplate;
  }

  private buildFilters(filters: any) {
    const query: any = {};

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' }; // Case-insensitive search for template name
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.language) {
      query.language = filters.language;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    return query;
  }
}
