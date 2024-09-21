import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(
    @Body(' ') message: string,
    @Body('type') type: string,
    @Body('roomId') roomId: string,
  ) {
    return await this.chatService.sendMessageOnWhatsApp(message, type, roomId);
  }
}
