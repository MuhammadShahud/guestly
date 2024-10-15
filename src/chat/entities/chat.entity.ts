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
    imageUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    caption: {
      type: String,
    },

    whatsapp_image_id: {
      type: String,
    },
    whatsapp_video_id: {
      type: String,
    },
    whatsapp_audio_id: {
      type: String,
    },
    whatsapp_message_id: {
      type: Boolean,
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

    repy_to: {
      type: Types.ObjectId,
      ref: 'Chat',
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
