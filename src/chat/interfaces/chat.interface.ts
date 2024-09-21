import { Document } from 'mongoose';
import { IContact } from 'src/contacts/interface/contact.interface';
import { IUser } from 'src/user/interfaces/user.interface';

type Message = {
  message: string;
  type : 'text' | 'image' | 'audio' | 'video'
  isforwarded : boolean;
};

export interface IChat extends Document {
    message : Message,
    user : IUser
    contact : IContact
}
