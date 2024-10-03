import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { UpdateBroadcastDto } from './dto/update-broadcast.dto';
import { IBroadcast } from './interfaces/broadcast.enum';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { SendBroadcastDto } from './dto/send-broadcast.dto';

@ApiTags('Broadcasts')
@Controller('broadcasts')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new broadcast' })
  @ApiResponse({ status: 201, description: 'Broadcast created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(
    @Body() createBroadcastDto: CreateBroadcastDto,
  ): Promise<IBroadcast> {
    return this.broadcastService.create(createBroadcastDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all broadcasts with optional filters and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of broadcasts with pagination',
  })
  @ApiParam({ name: 'page', type: Number, required: false, example: 1 })
  @ApiParam({ name: 'limit', type: Number, required: false, example: 10 })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: any,
  ): Promise<{
    data: IBroadcast[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.broadcastService.findAll(filters, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a broadcast by ID' })
  @ApiResponse({
    status: 200,
    description: 'Broadcast retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Broadcast not found.' })
  async findOne(@Param('id') id: string): Promise<IBroadcast> {
    return this.broadcastService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a broadcast by ID' })
  @ApiResponse({ status: 200, description: 'Broadcast updated successfully.' })
  @ApiResponse({ status: 404, description: 'Broadcast not found.' })
  @ApiBody({ type: UpdateBroadcastDto })
  @ApiParam({ name: 'id', description: 'ID of the broadcast to update' })
  async update(
    @Param('id') id: string,
    @Body() updateBroadcastDto: UpdateBroadcastDto,
  ): Promise<IBroadcast> {
    return this.broadcastService.update(id, updateBroadcastDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a broadcast by ID' })
  @ApiResponse({ status: 200, description: 'Broadcast deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Broadcast not found.' })
  async delete(@Param('id') id: string): Promise<IBroadcast> {
    return this.broadcastService.delete(id);
  }

  // @Post(':id/send')
  // @ApiOperation({ summary: 'Send broadcast message to contacts via WhatsApp' })
  // @ApiResponse({ status: 200, description: 'Broadcast sent successfully.' })
  // @ApiResponse({ status: 404, description: 'Broadcast not found.' })
  // @ApiResponse({ status: 500, description: 'Failed to send the broadcast.' })
  // async sendBroadcast(
  //   @Param('id') id: string,
  //   @Body() sendBroadcastDto: SendBroadcastDto,
  // ): Promise<any> {

  //   const broadcast = await this.broadcastService.findOne(id);

  //   if (!broadcast) {
  //     throw new HttpException('Broadcast not found', HttpStatus.NOT_FOUND);
  //   }

  //   try {
  //     return { message: 'Broadcast sent successfully to all contacts.' };
  //   } catch (error) {
  //     throw new HttpException(
  //       'Failed to send the broadcast',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
