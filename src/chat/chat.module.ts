import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { chatSchema } from './entities/chat.entity';
import { UserSchema } from 'src/user/user.entity';
import { contactSchema } from 'src/contacts/entities/contact.entity';
import { ToolsAndIntegration } from 'src/tools-integrations/tools-integration.entity';
import { RoomSchema } from './entities/room.entity';
import { ApiService } from 'src/utils/apiServise';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chat', schema: chatSchema },
      { name: 'Room', schema: RoomSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Contacts', schema: contactSchema },
      { name: 'Tools-Integration', schema: ToolsAndIntegration },
    ]),
    forwardRef(() => WhatsappModule),
  ],
  controllers: [RoomController, MessageController],
  providers: [
    ChatService,
    ChatGateway,
    ApiService,
    RoomService,
    MessageService,
  ],
  exports: [ChatService, ChatGateway, RoomService, MessageService],
})
export class ChatModule {}
