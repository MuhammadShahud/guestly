import { Schema } from 'mongoose';
import { CampaignStatus } from './enums/campaign.emun';

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
    date: {
      type: String,
    },
    time: {
      type: String,
    },
  },
  { _id: false },
);

const CampaignSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },

    contact_segment: {
      type: Schema.Types.ObjectId,
      ref: 'ContactSegment',
      required: [true, 'ContactSegment id is required'],
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
        values: Object.keys(CampaignStatus),
        message: `{VALUE} is not supported.`,
      },
      default: CampaignStatus.DRAFT,
    },

    scheduling: {
      type: SchedulingSchema,
      required: [true, 'scheduling are required'],
    },
  },
  { timestamps: true },
);

export { CampaignSchema };
