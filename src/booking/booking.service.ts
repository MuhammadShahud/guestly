import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { IBooking } from './interfaces/booking.interface';
import mongoose, { Model } from 'mongoose';
import { ContactsService } from 'src/contacts/contacts.service';
import { IUser } from 'src/user/interfaces/user.interface';
import { pagination } from 'src/common/interface/pagination';
import { _pagination, buisnessFilter } from 'src/utils/utils.helper';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import moment from 'moment';
@Injectable()
export class BookingService {
  constructor(
    @InjectModel('Bookings') private readonly Booking: Model<IBooking>,
    private readonly contactService: ContactsService,
  ) {}
  async create(createBookingDto: CreateBookingDto, user: IUser) {
    const { mainGuestId, additionalGuestIds, ...rest } = createBookingDto;
    const result = await this.Booking.create({
      mainGuest: mainGuestId,
      additionalGuests: additionalGuestIds,
      bussiness: user.currentBuisness._id,
      ...rest,
    });
    await this.contactService.updateContactBooking(
      { _id: mainGuestId },
      {
        $addToSet: {
          bookings: result._id,
        },
      },
    );
    return result;
  }

  async findAll(
    user: IUser,
    query: pagination,
    from: string,
    to: string,
    treatment: string,
    children: string,
    search: string,
    filter: string,
    status: string,
  ): Promise<{
    data: IBooking[];
    totalCount: number;
    inHouse: number;
    checkOut: number;
    arrivingSoon: number;
    upcoming: number;
    cancelled: number;
  }> {
    if (['null', 'undefined'].includes(from)) from = undefined;
    if (['null', 'undefined'].includes(to)) to = undefined;
    if (['null', 'undefined'].includes(treatment)) treatment = undefined;
    if (['null', 'undefined'].includes(children)) children = undefined;
    if (['null', 'undefined'].includes(search)) search = undefined;
    if (['null', 'undefined'].includes(filter)) filter = undefined;
    if (['null', 'undefined'].includes(status)) status = undefined;

    const { limit, skip } = _pagination(query);

    const dbQuery = {
      bussiness: user?.currentBuisness._id,
      ...(!!from && !!to
        ? {
            createdAt: {
              $gte: moment(from).toDate(),
              $lte: moment(to).toDate(),
            },
          }
        : !!from
          ? { createdAt: { $gte: moment(from).toDate() } }
          : !!to
            ? { createdAt: { $lte: moment(to).toDate() } }
            : {}),
      ...(!!treatment && {
        treatment: {
          $in: treatment.split(',').map((e) => e),
        },
      }),

      ...(!!status && {
        status: {
          $in: status.split(',').map((e) => e),
        },
      }),

      ...(!!children && children == 'true' && { children: { $gt: 0 } }),

      ...(!!filter && filter != 'all' && buisnessFilter(filter)),
    };

    const pipeline = [
      {
        $match: dbQuery,
      },
      {
        $lookup: {
          from: 'contacts',
          localField: 'mainGuest',
          foreignField: '_id',
          as: 'mainGuest',
        },
      },
      {
        $unwind: {
          path: '$mainGuest',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'contacts',
          localField: 'additionalGuests',
          foreignField: '_id',
          as: 'additionalGuests',
        },
      },
      {
        $match: {
          ...(!!search && {
            $or: [
              { 'mainGuest.name': { $regex: search, $options: 'i' } },
              { 'mainGuest.surName': { $regex: search, $options: 'i' } },
            ],
          }),
        },
      },
    ];

    const [data, inHouse, checkOut, arrivingSoon, upcoming, cancelled] =
      await Promise.all([
        this.Booking.aggregate([
          {
            $facet: {
              bookings: [
                ...pipeline,
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
              ],
              count: [...pipeline, { $count: 'total' }],
            },
          },
        ]),
        this.Booking.countDocuments({
          bussiness: user?.currentBuisness._id,
          checkIn: { $lte: moment().startOf('day').toDate() },
          checkOut: { $gt: moment().startOf('day').toDate() },
        }),
        this.Booking.countDocuments({
          bussiness: user?.currentBuisness._id,
          checkOut: {
            $gte: moment().startOf('day').toDate(),
          },
        }),
        this.Booking.countDocuments({
          bussiness: user?.currentBuisness._id,
          checkIn: { $gte: moment().startOf('day').toDate() },
        }),
        this.Booking.countDocuments({
          bussiness: user?.currentBuisness._id,
          checkIn: {
            $gte: moment().add(2, 'days').toDate(),
          },
        }),
        this.Booking.countDocuments({
          bussiness: user?.currentBuisness._id,
          status: 'cancelled',
        }),
      ]);

    await Promise.all(
      data[0]?.bookings.map(async (booking) => {
        await this.Booking.populate(booking, {
          path: 'comments.user',
          select: 'email image name',
        });
      }),
    );

    return {
      data: (data[0]?.bookings as IBooking[]) || [],
      totalCount: data[0]?.count[0]?.total || 0,
      inHouse,
      checkOut,
      arrivingSoon,
      upcoming,
      cancelled,
    };
  }

  async findOne(id: string) {
    console.log('id', id);
    const result = await this.Booking.findById(id).populate(
      'comments.user',
      'name image email',
    );
    if (!result) {
      throw new NotFoundException(`record with id ${id} doesnt exist`);
    }
    return result;
  }

  async update(
    updateBookingDto: UpdateBookingDto,
    user: IUser,
  ): Promise<{ data: IBooking }> {
    const { bookingId, additionalGuestIds, ...dto } = updateBookingDto;

    const contact = await this.Booking.findOne({ _id: bookingId });

    if (!contact) throw new BadRequestException('No contact found');

    const updatedTag = await this.Booking.findOneAndUpdate(
      { _id: bookingId },
      {
        additionalGuests: additionalGuestIds,
        ...dto,
      },
      {
        new: true,
      },
    );

    return { data: updatedTag as IBooking };
  }

  async remove(bookingId: string, user: IUser) {
    const ids = bookingId.split(',').map((e) => new mongoose.Types.ObjectId(e));

    await this.Booking.deleteMany({ _id: { $in: ids } });

    return { message: 'item deleted' };
  }

  async createComment(createCommentDto: CreateCommentDto, user: IUser) {
    const { bookingId, ...rest } = createCommentDto;
    rest.user = user?._id;
    const data = await this.Booking.findOneAndUpdate(
      { _id: bookingId },
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

  async updateComment(updateCommentDto: UpdateCommentDto, user: IUser) {
    const { bookingId, commentId, comment } = updateCommentDto;
    console.log(updateCommentDto);

    const data = await this.Booking.findOneAndUpdate(
      {
        _id: bookingId,
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
  async fetchComments(bookingId: string) {
    const data = await this.Booking.findById(bookingId, 'comments').populate({
      path: 'comments.user',
      select: 'name image',
      model: 'User',
      options: { skipUserPopulation: true },
    });

    return data;
  }
  async deleteComment(bookingId: string, commentId: string) {
    const data = await this.Booking.findOneAndUpdate(
      { _id: bookingId },
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
}
