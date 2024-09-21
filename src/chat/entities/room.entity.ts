import { Schema, Types } from 'mongoose';

const RoomSchema = new Schema({
  business: {  // Make sure this field is spelled correctly
    type: Types.ObjectId,
    ref: 'Business',  // Make sure this is the correct model reference
    required : true
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
  },
  contact: {
    type: Types.ObjectId,
    ref: 'User',
  },
  message: {
    lastMessage: { type: String, default: null },
    lastChatted: { type: Date, default: null },
  },
  status: {
    type: String,
    enum: ['open', 'close'],
    default: 'open',
  },
});


export { RoomSchema };
