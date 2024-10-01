import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateScheduledMessageDto } from './dto/create-scheduled-message.dto';
import { ScheduledMessage } from './interfaces/scheduled-message.interface';
import { ScheduledMessageService } from './scheduled-messages.service';
import { UpdateScheduledMessageDto } from './dto/update-scheduled-message.dto';

@ApiTags('Scheduled Messages')
@Controller('scheduled-messages')
export class ScheduledMessageController {
  constructor(
    private readonly scheduledMessageService: ScheduledMessageService,
  ) {}

  @ApiOperation({ summary: 'Create a scheduled message' })
  @ApiResponse({
    status: 201,
    description: 'The scheduled message has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Post()
  async create(
    @Body() createScheduledMessageDto: CreateScheduledMessageDto,
  ): Promise<ScheduledMessage> {
    return this.scheduledMessageService.create(createScheduledMessageDto);
  }

  @ApiOperation({
    summary: 'Get all scheduled messages with optional filters and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'All scheduled messages retrieved successfully.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    example: 'Active',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    example: 'Welcome Message',
  })
  @ApiQuery({
    name: 'business',
    required: false,
    type: String,
    example: '60dfef1e2a3f2c1b7d4df13b',
  })
  @ApiQuery({ name: 'language', required: false, type: String, example: 'en' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: any,
  ): Promise<any> {
    return this.scheduledMessageService.findAll(filters, page, limit);
  }

  @ApiOperation({ summary: 'Get a scheduled message by ID' })
  @ApiResponse({
    status: 200,
    description: 'Scheduled message retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Scheduled message not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ScheduledMessage> {
    return this.scheduledMessageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a scheduled message by ID' })
  @ApiResponse({
    status: 200,
    description: 'Scheduled message updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Scheduled message not found.' })
  @ApiBody({ type: UpdateScheduledMessageDto })
  @ApiParam({
    name: 'id',
    description: 'ID of the scheduled message to update',
  })
  async update(
    @Param('id') id: string,
    @Body() updateScheduledMessageDto: UpdateScheduledMessageDto,
  ): Promise<ScheduledMessage> {
    return this.scheduledMessageService.update(id, updateScheduledMessageDto);
  }

  @ApiOperation({ summary: 'Delete a scheduled message by ID' })
  @ApiResponse({
    status: 200,
    description: 'Scheduled message deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Scheduled message not found.' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<ScheduledMessage> {
    return this.scheduledMessageService.delete(id);
  }
}
