// src/schemas/pms.schema.ts

import mongoose, { Document, Schema } from 'mongoose';

export const PMS = new Schema({
    business: {
    type: mongoose.Types.ObjectId,
    ref: 'Buisness',
    unique: true,
    required: [true, 'business is required'],
  },

  username: {
    type: String,
    required: [true, 'username is required'],
    unique: [true, 'username is already exist'],
  },

  password: {
    type: String,
    required: [true, 'password is required'],
  },

  status: {
    type: String,
    default: 'active',
  },
});
