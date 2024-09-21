import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { chatSchema } from './entities/chat.entity';
import { UserSchema } from 'src/user/user.entity';
import { contactSchema } from 'src/contacts/entities/contact.entity';
import { ToolsAndIntegration } from 'src/tools-integrations/tools-integration.entity';
import { RoomSchema } from './entities/room.entity';
import { ApiService } from 'src/utils/apiServise';

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
  controllers: [ChatController],
  providers: [ChatService, ApiService],
  exports: [ChatService],
})
export class ChatModule {}
