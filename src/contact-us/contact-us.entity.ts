import { Schema } from 'mongoose';

const ContactUsSchema = new Schema(
  {
    company: {
      type: String,
      trim: true,
    },
    first_name: {
      type: String,
      trim: true,
    },
    surname: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone_no: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    pp_accepted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export { ContactUsSchema };
