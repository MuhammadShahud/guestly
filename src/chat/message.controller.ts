import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilterMessagesDto } from './dto/filter-messages.dto';
import { IChat } from './interfaces/chat.interface';
import { Validate } from 'class-validator';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({
    status: 201,
    description: 'The message has been successfully sent.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<IChat> {
    return this.messageService.sendMessage(createMessageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get messages with filters and pagination' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async getMessages(
    @Query() filterMessagesDto: FilterMessagesDto,
  ): Promise<{ data: IChat[]; total: number }> {
    return this.messageService.getMessages(filterMessagesDto);
  }
}
