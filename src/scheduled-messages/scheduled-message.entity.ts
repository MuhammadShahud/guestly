import { Schema } from 'mongoose';

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

const ScheduledMessageSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },

    template: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: [true, 'template id is required'],
    },

    language: {
      type: String,
      required: [true, 'Please provide a language'],
    },
    body_variables: {
      type: [BodyVariableSchema],
      default: [],
    },

    business: {
      type: Schema.Types.ObjectId,
      ref: 'Buisness',
      required: [true, 'business id are required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'InActive'],
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
