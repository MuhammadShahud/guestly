import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilterMessagesDto } from './dto/filter-messages.dto';
import { IChat } from './interfaces/chat.interface';
import { ChatService } from './chat.service';
import { RoomService } from './room.service';
import { ChatGateway } from './chat.gateway';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Chat') private readonly chatModel: Model<IChat>,
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    private readonly chatGateway: ChatGateway,
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(docs): Promise<IChat> {
    return this.chatModel.create(docs);
  }

  async sendMessage(createMessageDto: CreateMessageDto): Promise<IChat> {
    try {
      const newMessage = new this.chatModel({
        user: createMessageDto.user,
        room: createMessageDto.room,
        replyTo: createMessageDto.replyTo,
        contact: createMessageDto.contact,
        from: createMessageDto.from,
        to: createMessageDto.to,
        isSeen: createMessageDto.isSeen,
        message: {
          isforwarded: createMessageDto.isForwarded,
          message: createMessageDto.message,
          type: createMessageDto.type,
          audioUrl: createMessageDto.audioUrl,
          imageUrl: createMessageDto.imageUrl,
          videoUrl: createMessageDto.videoUrl,
          caption: createMessageDto.caption,
        },
      });

      await this.roomService.updateRoomById(newMessage.room, {
        message: {
          lastMessage: createMessageDto.message,
          lastChatted: new Date(),
        },
      });

      await newMessage.save();

      await newMessage.populate([
        // {
        //   path: 'user',
        //   select: '_id name image',
        //   model: 'User',
        // },
        {
          path: 'contact',
          select: '_id name phoneNo',
          model: 'Contacts',
        },
        {
          path: 'room',
          select: '_id',
          model: 'Room',
        },
      ]);


      await this.chatGateway.sendMessageToRoom(
        newMessage.user._id.toString(),
        newMessage,
      );

      await this.whatsappService.sendMessageByType(newMessage._id.toString());

      return newMessage;
    } catch (e) {
      console.log(e);
      throw new Error(`Error Sending message, ${e['message']}`);
    }
  }

  async getMessages(
    filterMessagesDto: FilterMessagesDto,
  ): Promise<{ data: IChat[]; total: number }> {
    const { room, from, to, page, limit } = filterMessagesDto;

    const query: any = {};
    if (room) query.room = room;
    if (from) query.from = from;
    if (to) query.to = to;

    const messages = await this.chatModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.chatModel.countDocuments(query).exec();

    return { data: messages, total };
  }

  async getMessageByFilter(filter: any): Promise<IChat> {
    return await this.chatModel.findOne(filter);
  }
}
