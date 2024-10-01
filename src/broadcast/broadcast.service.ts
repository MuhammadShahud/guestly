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

@Injectable()
export class BroadcastService {
  constructor(
    @InjectModel('Broadcast')
    private readonly broadcastModel: Model<IBroadcast>,
    private readonly configService: ConfigService,
    private readonly apiService: ApiService,
    private readonly templateService: TemplateService,
    private readonly contactService: ContactsService,
    private readonly ToolsIntegrationsService: ToolsIntegrationsService,
  ) {}

  async create(createBroadcastDto: CreateBroadcastDto): Promise<IBroadcast> {
    const broadcast = new this.broadcastModel(createBroadcastDto);
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

  async boradcastToWhatsApp(dto: CreateBroadcastDto): Promise<any> {
    const whatsappApiUrl = this.configService.get<string>('FACEBOOK_URL');
    const token = this.configService.get<string>('WHATSAPP_API_TOKEN');

    const tni = await this.ToolsIntegrationsService.getTandIFn({
      buisness: '66b9cd2c02f31fbde6a58acd',
    });

    const template = await this.templateService.findOne(dto.template);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const promises = dto.contacts.map(async (contactId) => {
      const contact = await this.contactService.findOne(contactId);

      const generatedMessage = this.generateMessageComp(
        template,
        dto.body_variables,
      );

      return await this.apiService.postApi(
        `${whatsappApiUrl}/${tni.whatsapp.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: contact.data.phoneNo,
          type: 'template',
          template: {
            name: template.name,
            language: {
              code: dto.language,
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: generatedMessage,
                  },
                ],
              },
            ],
          },
        },
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      );
    });

    if (false) {
      throw new HttpException(
        'Failed to send the broadcast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: 'Broadcast sent successfully to all contacts.' };
  }

  private generateMessageComp(template: any, variables: any[]): any[] {
    const components = [];

    // Generate the body component
    const bodyComponent = {
      type: 'body',
      parameters: [],
    };

    // Replace variables in the body and add them as parameters
    variables.forEach((variable) => {
      bodyComponent.parameters.push({
        type: 'text',
        text: variable.value, // Inject the actual value of the variable
      });
    });

    components.push(bodyComponent);

    // Generate button components if present in the template
    // if (template.buttons && template.buttons.length > 0) {
    //   template.buttons.forEach((button, index) => {
    //     const buttonComponent = {
    //       type: 'button',
    //       sub_type: 'CATALOG', // Assuming the sub_type is 'CATALOG', customize as needed
    //       index: index,
    //       parameters: [
    //         {
    //           type: 'action',
    //           action: {
    //             thumbnail_product_retailer_id: '2lc20305pt', // Example action, adjust as per your requirement
    //           },
    //         },
    //       ],
    //     };

    //     components.push(buttonComponent);
    //   });
    // }

    return components; // Return the array of components
  }

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
