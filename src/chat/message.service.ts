import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilterMessagesDto } from './dto/filter-messages.dto';
import { IChat } from './interfaces/chat.interface';
import { ChatService } from './chat.service';
import { RoomService } from './room.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Chat') private readonly chatModel: Model<IChat>,
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
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

      await this.chatService.sendMessageOnWhatsApp(
        newMessage.message.message,
        newMessage.message.type,
        newMessage.room,
      );

      return newMessage.save();
    } catch (e) {
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
