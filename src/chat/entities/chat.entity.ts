import { Schema, Types } from 'mongoose';

const messageSchema = new Schema(
  {
    message: {
      type: String,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'audio', 'video'],
    },
    isForwarded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const chatSchema = new Schema(
  {
    message: {
      type: messageSchema,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
    },
    room: {
      type: Types.ObjectId,
      ref: 'Room',
    },

    contact: {
      type: Types.ObjectId,
      ref: 'Contacts',
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    isSeen: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

export { chatSchema };
