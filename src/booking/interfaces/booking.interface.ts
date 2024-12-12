import { Document } from 'mongoose';
import { IBuisness } from 'src/buisness/interface/buisness.interface';
import { IContact } from 'src/contacts/interface/contact.interface';
import { IUser } from 'src/user/interfaces/user.interface';

type Comment = {
  user: IUser;
  comment: string;
};
export interface IBooking extends Document {
  mainGuest: IContact;
  additionalGuests: IContact[];
  checkIn: Date;
  checkOut: Date;
  status: 'CONFIRMED' | 'CHECKED-IN' | 'CHECKED-OUT' | 'CANCELLED';
  price: Number;
  treatment:
    | 'STAYONLY'
    | 'BED&BREAKFAST'
    | 'HALFBOARD'
    | 'FULLBOARD'
    | 'ALLINCLUSIVE';
  adults: Number;
  children: Number;
  roomNo: String;
  roomCategory: String;
  marketingSource: String;
  source: 'PMS' | 'WA' | 'User';
  bussiness: IBuisness;
  comments: Comment[];
  checkin_messages: String[];
  checkout_messages: String[];
  during_messages: String[];
}
