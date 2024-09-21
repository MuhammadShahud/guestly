import mongoose, { Schema } from 'mongoose';
import { Category, CHAT_IN_LANG, TYPE, VARIANT } from './enums/category.enum';

const chatInDetails = new Schema({
  phoneNumber: {
    type: String,
    default: null,
  },
  bubbleButton: {
    type: String,
    default: null,
  },
  bubbleMessage: {
    type: String,
    default: null,
  },
  chatInMessage: {
    type: String,
    default: null,
  },
  script: {
    type: String,
    default: null,
  },
  lang: {
    type: String,
    enum: Object.values(CHAT_IN_LANG),
  },
});

const Whatsapp = new Schema({
  logo: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  phoneNumberId: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  website: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    enum: Object.values(Category),
    default: Category.OTHER,
  },
  whatappAccountId: {
    type: String,
    default: null,
  },
  codeVerificationStatus: {
    type: String,
    default: null,
  },
  qualityRating: {
    type: String,
    default: null,
  },
});

const ToolsAndIntegration = new Schema(
  {
    buisness: {
      type: mongoose.Types.ObjectId,
      ref: 'Buisness',
    },
    type: {
      type: String,
      enum: Object.values(TYPE),
      default: null,
    },
    variant: {
      type: String,
      enum: Object.values(VARIANT),
      default: null,
    },
    whatsapp: {
      type: Whatsapp,
      default: () => ({}),
    },
    chatIn: {
      type: [chatInDetails],
      default: [],
    },
  },
  { timestamps: true },
);

const AllToolsAndIntegration = new Schema(
  {
    // buisness: {
    //   type: [{ type: mongoose.Types.ObjectId, ref: 'Buisness' }],
    // },
    logo: {
      type: String,
      required: [true, 'logo is required'],
    },
    name: {
      type: String,
      required: [true, 'title is required'],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: [true, 'category is required'],
    },
    variant: {
      type: String,
      enum: Object.values(VARIANT),
      required: [true, 'variant is required'],
    },
  },
  {
    timestamps: true,
  },
);

export { ToolsAndIntegration, AllToolsAndIntegration };
