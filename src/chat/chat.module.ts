import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { chatSchema } from './entities/chat.entity';
import { UserSchema } from 'src/user/user.entity';
import { contactSchema } from 'src/contacts/entities/contact.entity';
import { ToolsAndIntegration } from 'src/tools-integrations/tools-integration.entity';
import { RoomSchema } from './entities/room.entity';
import { ApiService } from 'src/utils/apiServise';
import { ChatGateway } from './chat.gateway';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chat', schema: chatSchema },
      { name: 'Room', schema: RoomSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Contacts', schema: contactSchema },
      { name: 'Tools-Integration', schema: ToolsAndIntegration },
    ]),
  ],
  controllers: [RoomController, MessageController],
  providers: [
    ChatService,
    ApiService,
    ChatGateway,
    RoomService,
    MessageService,
  ],
  exports: [ChatService, RoomService, MessageService, RoomService],
})
export class ChatModule {}
