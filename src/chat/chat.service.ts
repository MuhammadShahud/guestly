import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IContact } from 'src/contacts/interface/contact.interface';
import { IToolsIntegration } from 'src/tools-integrations/interfaces/interafce';
import { IUser } from 'src/user/interfaces/user.interface';
import { IChat } from './interfaces/chat.interface';
import { IRoom } from './interfaces/room.interface';
import { ApiService } from 'src/utils/apiServise';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Chat') private readonly Chat: Model<IChat>,
    @InjectModel('Room') private readonly Room: Model<IRoom>,
    @InjectModel('User') private readonly User: Model<IUser>,
    @InjectModel('Contacts') private readonly Contacts: Model<IContact>,
    @InjectModel('Tools-Integration')
    private readonly ToolsAndIntegration: Model<IToolsIntegration>,
    private readonly apiService: ApiService,
  ) {}

  async initializeChat(
    user: string,
    contact: IContact,
  ): Promise<{ data: IRoom }> {
    const message = {
      lastMessage: null,
      lastChatted: null,
    };

    const _user = await this.User.findOne({ _id: user }).lean();

    const business = _user.currentBuisness._id;

    const room = await this.Room.findOne({
      business,
      contact: contact._id,
      user: _user._id,
    });

    if (room) {
      return { data: room as IRoom };
    }
    const newRoom = await this.Room.create({
      business,
      user: _user._id,
      contact: contact._id,
      message,
    });

    return { data: newRoom as IRoom };
  }

  async sendMessageOnWhatsApp(message: string, type: string, roomId: string) {
    const room = await this.Room.findById(roomId).lean();
    if (!room) throw new Error('Room not found');

    const [contact, TAndI] = await Promise.all([
      this.Contacts.findById(room.contact),
      this.ToolsAndIntegration.findOne({ business: room.buisness }),
    ]);

    console.log(contact.phoneNo)
    const [err, response] = await this.apiService.postApi(
      'https://graph.facebook.com/v20.0/112084118643124/messages',
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: contact.phoneNo, // Update to dynamic value if needed
        type: 'text',
        text: {
          preview_url: true,
          body: message, // Use the provided message dynamically
        },
      },
      {
        Authorization: `Bearer EAADGrQDEWDoBO49fZCx3PAAqJZCgDRRrY4vomewpHlXk79cOcZC3g7Xh7yZCkfaaKEFocvlWF39Mom6dUZChjLaQ2hqm8iJEAsZBZC1mMYJPNP7ZC55iTey7slQt9u2pYyASy4GZA9Y0ZB6xoTdbScDFc6McM7uKZCtrOp7OSRGHgZAY5WAcPmmzI8oumC28yRKjVh3lh4CZByJHw4ZAZBJ9yEUlik0aNvZAtjXlugTXSimsClinxiYZD`,
      },
    );

    if (err) throw new BadGatewayException('Failed to send message' , err.message);

    const [chat, updatedRoom] = await Promise.all([
      this.Chat.create({
        message: {
          message,
          type,
        },
        user: room.user,
        contact: room.contact,
        from: room.user,
        to: room.contact,
      }),
      this.Room.findByIdAndUpdate(
        roomId,
        { $set: { lastMessage: message, lastChatted: new Date() } },
        { new: true },
      ),
    ]);

    return chat;
  }

  async getAllRoom(user: IUser, filter: string) {
    const dbQuery = {
      ...(!!filter &&
        filter != 'all' && {
          status: filter,
        }),
      user: user._id,
      buisness: user.currentBuisness,
    };
    const [rooms, totalRooms] = await Promise.all([
      this.Room.find(dbQuery),
      this.Room.countDocuments(dbQuery),
    ]);

    return { rooms, totalRooms };
  }

  async createChat(
    roomId: string,
    type: string,
    message: string,
    isForwarded: boolean,
    user: string,
    contact: string,
  ) {
    console.log(roomId);
    await Promise.all([
      this.Chat.create({
        message: {
          message,
          isForwarded,
          type: type,
        },
        user: user,
        contact: contact,
        room: roomId,
        from: contact,
        to: user,
      }),
      this.Room.findByIdAndUpdate(roomId, {
        message: {
          lastMessage: message,
          lastChatted: new Date(),
        },
      }),
    ]);
  }
}
