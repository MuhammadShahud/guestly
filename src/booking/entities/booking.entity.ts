import { timeStamp } from 'console';
import { Schema } from 'mongoose';

export const CommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'please provide user Id'],
    },
    comment: {
      type: String,
      trim: true,
      required: [true, 'comment is required'],
    },
  },
  { timestamps: true },
);

const BookingSchema = new Schema(
  {
    mainGuest: {
      type: Schema.Types.ObjectId,
      ref: 'Contacts',
      required: [true, 'please provide main guest contact Id'],
    },
    additionalGuests: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Contacts',
          index: true,
        },
      ],
      default: [],
    },
    checkIn: {
      type: Date,
      default: null,
      reqiured: [true, 'checkIn is a required feild'],
    },
    checkOut: {
      type: Date,
      default: null,
      reqiured: [true, 'checkOut is a required feild'],
    },
    status: {
      type: String,
      enum: {
        values: ['CONFIRMED', 'CHECKED-IN', 'CHECKED-OUT', 'CANCELLED'],
        message: `{VALUE} is not supported.`,
      },
      default: 'CHECKED-IN',
    },
    price: {
      type: Number,
      default: null,
      reqiured: [true, 'price is a required feild'],
    },
    treatment: {
      type: String,
      enum: {
        values: [
          'STAYONLY',
          'BED&BREAKFAST',
          'HALFBOARD',
          'FULLBOARD',
          'ALLINCLUSIVE',
        ],
        message: `{VALUE} is not supported.`,
      },
      reqiured: [true, 'treatment is a required feild'],

      default: null,
    },
    adults: {
      type: Number,
      default: null,
      reqiured: [true, 'adults is a required feild'],
    },
    children: {
      type: Number,
      default: 0,
    },
    roomNo: {
      type: String,
      trim: true,
      default: null,
    },
    roomCategory: {
      type: String,
      trim: true,
      default: null,
    },
    marketingSource: {
      type: String,
      trim: true,
      default: null,
    },
    source: {
      type: String,
      enum: {
        values: ['PMS', 'WA', 'User'],
        message: `{VALUE} is not supported.`,
      },
      default: 'User',
    },
    bussiness: {
      type: Schema.Types.ObjectId,
      ref: 'Buisness',
      required: [true, 'please provide business Id'],
      default: null,
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true },
);
export { BookingSchema };
