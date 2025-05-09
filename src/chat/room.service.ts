import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoomDto } from './dto/create-room.dto';
import { FilterRoomDto } from './dto/filter-room.dto';
import { IRoom } from './interfaces/room.interface';

@Injectable()
export class RoomService {
  constructor(@InjectModel('Room') private readonly roomModel: Model<IRoom>) {}

  async getRooms(
    filterRoomDto: FilterRoomDto,
  ): Promise<{ data: IRoom[]; total: number }> {
    const { business, status, page, limit } = filterRoomDto;

    const query: any = {};
    if (business) query.business = business;
    if (status) query.status = status;

    const rooms = await this.roomModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.roomModel.countDocuments(query).exec();

    return { data: rooms, total };
  }

  async getRoomByFilter(filter: any): Promise<IRoom> {
    return await this.roomModel.findOne(filter);
  }
  async updateRoomById(id: string, data: any) {
    return await this.roomModel.findByIdAndUpdate(id, data, { new: true });
  }
}
