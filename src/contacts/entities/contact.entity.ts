import { Schema } from 'mongoose';
import { CommentSchema } from 'src/booking/entities/booking.entity';
import { AddressSchema } from 'src/organization/entities/address.entity';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null,
      required: [true, 'Name is required'],
    },
    surName: {
      type: String,
      trim: true,
      default: null,
    },
    phoneNo: {
      type: String,
      trim: true,
      default: null,
      required: [true, 'phoneNo is required'],
    },
    whatsAppId: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      default: null,
    },
    language: {
      type: String,
      enum: {
        values: ['en', 'it', 'de'],
        message: `{VALUE} is not supported.`,
      },
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: `{VALUE} is not supported.`,
      },
    },
    profile: {
      type: String,
      enum: {
        values: ['completed', 'incomplete'],
        message: `{VALUE} is not supported.`,
      },
    },
    birthDate: {
      type: Date,
      trim: true,
      default: null,
    },
    address: {
      type: AddressSchema,
      default: null,
    },
    tags: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Tags',
          index: true,
        },
      ],
      default: [],
    },
    buisness: {
      type: Schema.Types.ObjectId,
      ref: 'Buisness',
      default: null,
    },
    marketinOptions: {
      type: String,
      trim: true,
      enum: {
        values: ['SUBSCRIBED', 'NON-SUBSCRIBED', 'UNSUBSCRIBED'],
        message: `{VALUE} is not supported.`,
      },
      default: null,
    },
    MarketingOptInDate: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      default:"Manual",
      trim: true,
      enum: {
        values: ['PMS', 'WA', 'User','Manual'],
        message: `{VALUE} is not supported.`,
      },
    },
    bookings: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Bookings' }],
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true },
);

contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

export { contactSchema };
