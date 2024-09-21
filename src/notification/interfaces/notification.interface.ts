import { Document } from 'mongoose';

export interface INotification extends Document {
  message: string;
  seen: boolean;
  // will un-comment it after i have user interface
  //   recieverId: IUser,
  //   senderId: IUser,

  recieverId: string;
  senderId: string;

  // will uncomment it after i have enum decided for the application
  //   flag: 'message' | 'booking'
  flag: string;
}
