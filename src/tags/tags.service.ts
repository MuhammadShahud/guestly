import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITag } from './interface.ts/tag.interface';
import { IUser } from 'src/user/interfaces/user.interface';
import { pagination } from 'src/common/interface/pagination';
import { _pagination } from 'src/utils/utils.helper';

@Injectable()
export class TagsService {
  constructor(@InjectModel('Tags') private readonly Tags: Model<ITag>) {}

  async create(
    createTagDto: CreateTagDto,
    user: IUser,
  ): Promise<{ data: ITag }> {
    createTagDto.bussinessId = user?.currentBuisness._id;
    const duplicateCheck = await this.Tags.findOne({
      bussinessId: createTagDto?.bussinessId,
      tagName: new RegExp(`^${createTagDto?.tagName}$`, 'i'),
    });
    if (duplicateCheck) {
      throw new ConflictException(
        'Tag already exists in this bussiness with this tag name',
      );
    }
    const data = await this.Tags.create(createTagDto);

    return { data };
  }

  async findAll(
    user: IUser,
    query: pagination,
  ): Promise<{ data: ITag[]; totalCount: number }> {
    const { limit, skip } = _pagination(query);

    const [tags, totalCount] = await Promise.all([
      this.Tags.find({ bussinessId: user?.currentBuisness._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      this.Tags.countDocuments({ bussinessId: user?.currentBuisness._id }),
    ]);

    return { data: tags as ITag[], totalCount };
  }

  async findOne(tagId: string): Promise<{ data: ITag }> {
    const data = await this.Tags.findOne({ _id: tagId });

    if (!data) throw new BadRequestException('No Tag found');

    return { data: data as ITag };
  }

  async update(
    updateTagDto: UpdateTagDto,
    user: IUser,
  ): Promise<{ data: ITag }> {
    const { tagId, ...dto } = updateTagDto;

    const tag = await this.Tags.findOne({ _id: tagId });

    if (!tag) throw new BadRequestException('No tag found');
    // if (tag.organizationId._id !== user?.currentOrganization._id)
    //   throw new UnauthorizedException(
    //     'Uou are not authorize to perform this action',
    //   );

    const updatedTag = await this.Tags.findOneAndUpdate({ _id: tagId }, dto, {
      new: true,
    });

    return { data: updatedTag as ITag };
  }

  async remove(tagId: string, user: IUser) {
    const tag = await this.Tags.findOne({ _id: tagId });

    if (!tag) throw new BadRequestException('No tag found');

    await this.Tags.deleteOne({ _id: tagId });

    return { message: 'item deleted' };
  }
}
