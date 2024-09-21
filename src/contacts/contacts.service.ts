import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { model, Model } from 'mongoose';
import { IContact } from './interface/contact.interface';
import { IUser } from 'src/user/interfaces/user.interface';
import { pagination } from 'src/common/interface/pagination';
import { _pagination } from 'src/utils/utils.helper';
import {
  CreateContactCommentDto,
  UpdateContactCommentDto,
} from './dto/create-contact-comment.dto';
import { count } from 'console';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel('Contacts') private readonly Contact: Model<IContact>,
  ) {}
  async create(createContactDto: CreateContactDto, user: IUser) {
    createContactDto.buisness = user.currentBuisness._id;
    const result = await this.Contact.create(createContactDto);
    return result;
  }

  async findAll(
    user: IUser,
    query: pagination,
    tags: string,
    language: string,
    source: string,
    search: string,
  ): Promise<{ data: IContact[]; totalCount: number }> {
    if (['null', 'undefined'].includes(tags)) tags = undefined;
    if (['null', 'undefined'].includes(language)) language = undefined;
    if (['null', 'undefined'].includes(source)) source = undefined;
    if (['null', 'undefined'].includes(search)) search = undefined;

    const { limit, skip } = _pagination(query);

    const dbQuery = {
      buisness: user?.currentBuisness?._id,
      ...(!!tags && {
        tags: {
          $in: tags?.split(',').map((e) => new mongoose.Types.ObjectId(e)),
        },
      }),
      ...(!!language && {
        language,
      }),
      ...(!!source && {
        source,
      }),
      ...(!!search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { surName: { $regex: search, $options: 'i' } },
          { phoneNo: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }),
    };

    const [contacts, totalCount] = await Promise.all([
      this.Contact.find(dbQuery)
        .populate('tags')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      this.Contact.countDocuments(dbQuery),
    ]);

    return { data: contacts as IContact[], totalCount };
  }

  async findOne(id: string) {
    const data = await this.Contact.findById(id).populate('tags');

    if (!data) throw new BadRequestException('no data found');
    return { data };
  }
  async fetchComments(contactId: string) {
    const data = await this.Contact.findById(contactId, 'comments').populate({
      path: 'comments.user',
      select: 'name image',
      model: 'User',
      options: { skipUserPopulation: true },
    });

    return data;
  }
  async update(
    updateContactDto: UpdateContactDto,
    user: IUser,
  ): Promise<{ data: IContact }> {
    const { contactId, ...dto } = updateContactDto;

    const contact = await this.Contact.findOne({ _id: contactId });

    if (!contact) throw new BadRequestException('No contact found');

    const updatedTag = await this.Contact.findOneAndUpdate(
      { _id: contactId },
      dto,
      {
        new: true,
      },
    );

    return { data: updatedTag as IContact };
  }

  async remove(contactId: string, user: IUser) {
    const cntactIds = contactId.split(',');

    await this.Contact.deleteMany({ _id: { $in: cntactIds } });

    return { message: 'item deleted' };
  }

  async updateContactBooking(search: Object, params: Object) {
    return await this.Contact.findOneAndUpdate(search, params, { new: true });
  }

  async createComment(createCommentDto: CreateContactCommentDto, user: IUser) {
    const { contactId, ...rest } = createCommentDto;
    rest.user = user?._id;
    const data = await this.Contact.findOneAndUpdate(
      { _id: contactId },
      {
        $push: {
          comments: rest,
        },
      },
      {
        new: true,
      },
    );

    return { data };
  }

  async updateComment(updateCommentDto: UpdateContactCommentDto, user: IUser) {
    const { contactId, commentId, comment } = updateCommentDto;
    console.log(updateCommentDto);

    const data = await this.Contact.findOneAndUpdate(
      {
        _id: contactId,
        'comments._id': new mongoose.Types.ObjectId(commentId),
      },
      {
        $set: { 'comments.$.comment': comment },
      },
      {
        new: true,
      },
    );

    return { data };
  }

  async deleteComment(contactId: string, commentId: string) {
    const data = await this.Contact.findOneAndUpdate(
      { _id: contactId },
      {
        $pull: {
          comments: { _id: commentId },
        },
      },
      {
        new: true,
      },
    );

    return { data };
  }

  async getContactForSegment(query) {
    const pipeLine = [
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookings',
          foreignField: '_id',
          as: 'bookings',
        },
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags',
        },
      },
      {
        $match: {
          $or: query,
        },
      },
    ];

    const result = await this.Contact.aggregate([
      {
        $facet: {
          contacts: [...pipeLine],
          totalcount: [
            ...pipeLine,
            {
              $count: 'total',
            },
          ],
          bookingCount: [
            ...pipeLine,
            {
              $project: {
                bookingCount: { $size: '$bookings' },
              },
            },
            {
              $group: {
                _id: null,
                totalBookings: { $sum: '$bookingCount' },
              },
            },
          ],
        },
      },
    ]);

    return result;
  }

  async bulkTag(contactIds: string[], tagIds: string[]) {
    await this.Contact.updateMany(
      { _id: { $in: contactIds } },
      {
        $addToSet: {
          tags: { $each: tagIds },
        },
      },
    );
    return { mesage: 'data updated successfully' };
  }

  async getContactFn(search: Object) {
    console.log(search);
    return await this.Contact.findOne(search);
  }

  async createContactFn(params: Object) {
    return await this.Contact.create(params);
  }
}
