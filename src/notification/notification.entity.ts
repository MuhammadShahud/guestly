import mongoose, { Schema } from 'mongoose';

// payload to for redirection
// const payloadSchema = new Schema({});

const NotificationSchema = new Schema({
  message: {
    type: String,
    trim: true,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  recieverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  flag: {
    type: String,
    // will decide later
    //   enum : ['message','booking']
  },
});

export { NotificationSchema };
