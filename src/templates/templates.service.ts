import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITemplate } from './interfaces/template.interface';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel('Template') private readonly templateModel: Model<ITemplate>,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<ITemplate> {
    const existingTemplate = await this.templateModel.findOne({
      name: createTemplateDto.name,
      language: createTemplateDto.language,
    });
    // If a template with the same name and language exists, throw an error
    if (existingTemplate) {
      throw new Error(
        `A template with the name '${createTemplateDto.name}' and language '${createTemplateDto.language}' already exists.`,
      );
    }

    const createdTemplate = new this.templateModel(createTemplateDto);

    if (createdTemplate) {
      const t =
        await this.whatsappService.createWhatsappTemplate(createdTemplate);

      createdTemplate.status = String(t['status']);
      createdTemplate.whatsAppTemplateId = String(t['id']);
      createdTemplate.category = t['category'];
    }

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

    if (template && template.whatsAppTemplateId) {
      const t = await this.whatsappService.getTempleteById(
        template.whatsAppTemplateId,
      );

      if (t) {
        template.status = String(t['status']);
        template.whatsAppTemplateId = String(t['id']);
        template.category = t['category'];
      }
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

    if (existingTemplate && existingTemplate.whatsAppTemplateId) {
      await this.whatsappService.updateWhatsappTemplate(existingTemplate);

      const t = await this.whatsappService.getTempleteById(
        existingTemplate.whatsAppTemplateId,
      );

      if (t) {
        existingTemplate.status = String(t['status']);
        existingTemplate.whatsAppTemplateId = String(t['id']);
        existingTemplate.category = t['category'];
      }
    }

    if (!existingTemplate) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return existingTemplate.save();
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
