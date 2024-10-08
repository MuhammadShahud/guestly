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

const CampaignTemplateSchema = new Schema(
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

const CampaignSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },

    contact_segments: {
      type: [Schema.Types.ObjectId],
      ref: 'ContactSegment',
      required: [true, 'ContactSegment id is required'],
    },

    templates: {
      type: [CampaignTemplateSchema],
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
        values: Object.keys(CampaignStatus),
        message: `{VALUE} is not supported.`,
      },
      default: CampaignStatus.DRAFT,
    },
    err_message: {
      type: String,
    },
    scheduling: {
      type: SchedulingSchema,
      required: [true, 'scheduling are required'],
    },
  },
  { timestamps: true },
);

export { CampaignSchema };
