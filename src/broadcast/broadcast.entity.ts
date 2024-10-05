// src/broadcast/schemas/broadcast.schema.ts
import { Schema, Types } from 'mongoose';
import { BroadcastStatus } from './enum/broadcast.enum';

const BodyVariableSchema = new Schema(
  {
    variable_name: {
      type: String,
      required: [true, 'variable_name is required'],
    },
    value: {
      type: String,
      default: '',
    },
  },
  { _id: false },
);

const BroadcastTemplateSchema = new Schema(
  {
    template: {
      type: Schema.Types.ObjectId,
      ref: 'Template', // Update to your actual Booking model name
      required: [true, 'Template are required'],
    },
    language: {
      type: String,
      required: [true, 'language is required'],
    },
    body_variables: {
      type: [BodyVariableSchema],
      default: [],
    },
    is_default: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const BroadcastSchema = new Schema(
  {
    bookings: {
      type: [Schema.Types.ObjectId],
      ref: 'Booking', // Update to your actual Booking model name
      required: [true, 'bookings are required'],
    },

    templates: {
      type: [BroadcastTemplateSchema],
      required: [true, 'templates are required'],
    },

    business: {
      type: Schema.Types.ObjectId,
      ref: 'Business', // Ensure this matches your actual Business model
      required: [true, 'business id is required'],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(BroadcastStatus),
        message: '{VALUE} is not supported.',
      },
      default: BroadcastStatus.PENDING,
    },
  },
  { timestamps: true },
);

export { BroadcastSchema };
