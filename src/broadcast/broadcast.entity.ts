import { Schema } from 'mongoose';
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

const BroadcastSchema = new Schema(
  {
    contacts: {
      type: [Schema.Types.ObjectId],
      ref: 'Contacts',
      required: [true, 'Contact id is required'],
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
        values: Object.keys(BroadcastStatus),
        message: `{VALUE} is not supported.`,
      },
      default: BroadcastStatus.PENDING,
    },
  },
  { timestamps: true },
);

export { BroadcastSchema };
