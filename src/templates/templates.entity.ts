import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  TemplateButtonTypeEnum,
  TemplateCategoryEnum,
  TemplateContentTypeEnum,
  TemplateStatusEnum,
} from './enums/template.enum';

const TemplateHeader = new Schema(
  {
    content_type: {
      type: String,
      enum: {
        values: Object.values(TemplateContentTypeEnum),
        message: `{VALUE} is not supported.`,
      },
      required: true,
    },
    content_value: {
      type: String,
      required: [true, 'header content is required'],
    },
  },
  { _id: false },
);

const TemplateButtons = new Schema(
  {
    type: {
      type: String,
      enum: {
        values: Object.values(TemplateButtonTypeEnum),
        message: `{VALUE} is not supported.`,
      },
      required: true,
    },
    text: {
      type: String,
      required: [true, 'text content is required'],
    },
    value: {
      type: String,
      required: function () {
        return this.type === 'PHONE_NUMBER' || this.type === 'URL';
      },
    },
  },
  { _id: false },
);

const BodyVariableSchema = new Schema(
  {
    variable_name: {
      type: String,
      required: [true, 'variable_name is required'],
    },
    default_value: {
      type: String,
      default: '',
    },
  },
  { _id: false },
);

const TemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: {
        values: Object.values(TemplateCategoryEnum),
        message: `{VALUE} is not supported.`,
      },
    },
    language: {
      type: String,
      required: [true, 'Please provide a language'],
    },
    header: {
      type: TemplateHeader,
      default: null,
    },
    raw_html_body: {
      type: String,
      default: null,
    },
    body_variables: {
      type: [BodyVariableSchema],
      default: [],
    },
    footer: {
      type: String,
      default: null,
    },
    buttons: {
      type: [TemplateButtons],
      default: [],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TemplateStatusEnum),
        message: `{VALUE} is not supported.`,
      },
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

export { TemplateSchema };