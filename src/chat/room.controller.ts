import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { FilterRoomDto } from './dto/filter-room.dto';
import { IRoom } from './interfaces/room.interface';
import { ChatService } from './chat.service';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly chatService: ChatService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({
    status: 201,
    description: 'The room has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async createRoom(@Body() createRoomDto: CreateRoomDto): Promise<IRoom> {
    return this.chatService.initializeChat(
      createRoomDto.user,
      createRoomDto.contact,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get rooms with filters and pagination' })
  @ApiResponse({ status: 200, description: 'List of rooms' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async getRooms(
    @Query() filterRoomDto: FilterRoomDto,
  ): Promise<{ data: IRoom[]; total: number }> {
    return this.roomService.getRooms(filterRoomDto);
  }
}
