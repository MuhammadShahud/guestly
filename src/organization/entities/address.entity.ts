import { Schema } from 'mongoose';

const AddressSchema = new Schema(
  {
    street: {
      type: String,
      trim: true,
      required: [true, 'Street is required'],
    },
    city: {
      type: String,
      trim: true,
      required: [true, 'City is required'],
    },
    zip: {
      type: String,
      trim: true,
      required: [true, 'ZIP is required'],
    },
    country: {
      type: String,
      trim: true,
      required: [true, 'Country is required'],
    },
    province: {
      type: String,
      trim: true,
      required: [true, 'Province is required'],
    },
  },
  { timestamps: true },
);

export { AddressSchema };
