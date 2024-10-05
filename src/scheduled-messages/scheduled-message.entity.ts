import { Schema } from 'mongoose';
import { ScheduleMessageStatus } from './enum/schedule-message.enum';

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

const SchedulingSchema = new Schema(
  {
    action: {
      type: String,
      required: [true, 'action is required'],
    },
    day: {
      type: String,
    },
    time: {
      type: String,
    },
  },
  { _id: false },
);

const ScheduledMessageTemplateSchema = new Schema(
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

const ScheduledMessageSchema = new Schema(
  {
    contact_segments: {
      type: [Schema.Types.ObjectId],
      ref: 'ContactSegment',
      required: [true, 'ContactSegment id is required'],
    },

    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },

    templates: {
      type: [ScheduledMessageTemplateSchema],
      required: [true, 'templates are required'],
    },

    business: {
      type: Schema.Types.ObjectId,
      ref: 'Buisness',
      required: [true, 'business id are required'],
    },
    status: {
      type: String,
      enum: {
        values: Object.keys(ScheduleMessageStatus),
        message: `{VALUE} is not supported.`,
      },
      default: 'Active',
    },

    scheduling: {
      type: SchedulingSchema,
      required: [true, 'scheduling are required'],
    },
  },
  { timestamps: true },
);

export { ScheduledMessageSchema };
