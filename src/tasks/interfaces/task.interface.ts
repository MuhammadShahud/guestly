import { Document } from 'mongoose';
import { IContact } from 'src/contacts/interface/contact.interface';
import { ITag } from 'src/tags/interface.ts/tag.interface';
import { IUser } from 'src/user/interfaces/user.interface';

export interface ITask extends Document {
  name: string;
  info: string;
  contactId: IContact;
  status: 'open' | 'in-progress' | 'completed';
  description: string;
  dueDate: Date;
  assignedTo: IUser;
  tags: ITag[];
  attachment: string[];
}
