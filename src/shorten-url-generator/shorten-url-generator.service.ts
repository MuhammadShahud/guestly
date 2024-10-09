import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUrl } from './interfaces/shorten-url-generator.interface';
import { Model } from 'mongoose';
import { CreateUrlDto } from './dto/create-url.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShortenUrlGeneratorService {
  constructor(@InjectModel('Url') private readonly urlModel: Model<IUrl>) {}

  async create(createUrlDto: CreateUrlDto): Promise<IUrl> {
    console.log(createUrlDto);
    const shortenUrl = uuidv4().slice(0, 8); // Generate a short ID
    const createdUrl = new this.urlModel({
      ...createUrlDto,
      shorten_url: shortenUrl,
    });
    return await createdUrl.save();
  }

  async findOne(shortenUrl: string): Promise<IUrl> {
    return await this.urlModel.findOne({ shorten_url: shortenUrl }).exec();
  }
}
