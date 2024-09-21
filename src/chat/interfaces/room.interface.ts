import { Document } from 'mongoose';
import { IBuisness } from 'src/buisness/interface/buisness.interface';
import { IContact } from 'src/contacts/interface/contact.interface';
import { IUser } from 'src/user/interfaces/user.interface';


type Message = {
  lastMessage: string;
  lastChatted: Date;
};

export interface IRoom extends Document {
  user : IUser;
  contact : IContact;
  message: Message;
  buisness: IBuisness;
  status: 'open' | 'close';
  media: string[];
}
