import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatIn, UpdateChatInDto } from './dto/chat-in-dto';
import { TYPE, VARIANT } from './enums/category.enum';
import {
  IAllToolsIntegration,
  IToolsIntegration,
} from './interfaces/interafce';
import { BuisnessService } from 'src/buisness/buisness.service';
import { IUser } from 'src/user/interfaces/user.interface';
import { CreateWhatsAppDetailsDto } from './dto/create-whatsapp-details.dto';

@Injectable()
export class ToolsIntegrationsService {
  constructor(
    @InjectModel('Tools-Integration')
    private readonly ToolsAndIntegration: Model<IToolsIntegration>,
    @InjectModel('AllToolsAndIntegration')
    private readonly AllToolsAndIntegration: Model<IAllToolsIntegration>,
    @Inject(forwardRef(() => BuisnessService))
    private readonly buisnessService: BuisnessService,
  ) { }

  async connectChatin(chatInDto: CreateChatIn, user: IUser) {
    const { chatIn } = chatInDto;
    console.log(chatIn);

    const data = await this.ToolsAndIntegration.create({
      buisness: user.currentBuisness._id,
      chatIn: chatIn,
      type: TYPE.CHAT_IN,
      variant: VARIANT.TOOL,
    });

    await this.buisnessService.updateBuisnessHelper(
      { _id: user.currentBuisness._id },
      {
        $addToSet: {
          integrationsAndTools: 'chat-ins',
        },
      },
    );
    return { data };
  }

  async updateChatIn(updateCHatIn: UpdateChatInDto) {
    const { chatInId, chatIn } = updateCHatIn;

    const data = await this.ToolsAndIntegration.findOneAndUpdate(
      { _id: chatInId },
      {
        chatIn: chatIn,
      },
      { new: true },
    );

    return { data };
  }

  async getToolsAndIntegration(filter: string, user: IUser) {
    const dbQuery = filter === "all" ? {} : {
      ...(filter == VARIANT.TOOL
        ? {
          variant: VARIANT.TOOL,
        }
        : { variant: VARIANT.INTEGRATION }),
    };

    console.log(dbQuery);
    const allAvailableToolsAndIntegration =
      await this.AllToolsAndIntegration.find(dbQuery).sort('-createdAt');
    const toolsAndIntegrationConfig =
      await this.ToolsAndIntegration.find({ buisness: user.currentBuisness._id });

    const data = allAvailableToolsAndIntegration.map((tAndI: any) => {
      tAndI.configuration = toolsAndIntegrationConfig.find((e: any) => e.type == tAndI.name)
      return {...tAndI.toObject(), configuration: tAndI.configuration}
    })

    
    // console.log(data)
    return { data };
  }

  async getSingleItem(id: string) {
    const data = await this.ToolsAndIntegration.findById(id);

    return { data };
  }

  async updateWhatsappDetails(
    updatewhatsAppDetailsDto: CreateWhatsAppDetailsDto,
    user: IUser,
  ) {
    return {
      userId: user.id,
      data: updatewhatsAppDetailsDto,
    };
  }
  async createTAndI(bussinessId: string) {
    await this.ToolsAndIntegration.create({
      buisness: bussinessId,
    });
  }

  async updateTandI(search: Object, params: Object) {
    console.log("search", search)
    console.log("params", params)
    return await this.ToolsAndIntegration.findOneAndUpdate(search, params, { new: true });
  }
  async getTandIFn(search: Object){
    return await this.ToolsAndIntegration.findOne(search);
  }
}
