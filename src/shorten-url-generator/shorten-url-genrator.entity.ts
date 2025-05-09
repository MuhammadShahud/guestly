import { Schema } from 'mongoose';

const UrlSchema = new Schema(
  {
    original_url: {
      type: String,
      required: [true, 'Please provide a original_url'],
      trim: true,
    },
    shorten_url: {
      type: String,
    },
  },
  { timestamps: true },
);

export { UrlSchema };
