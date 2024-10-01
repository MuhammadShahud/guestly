import { Document } from 'mongoose';
import { BroadcastStatus } from '../enum/broadcast.enum';

export interface IBroadcast extends Document {
  contacts: string[];
  template: string;
  language: string;
  body_variables: Array<{ variable_name: string; value: string }>;
  business: string;
  status: BroadcastStatus;
  createdAt: Date;
  updatedAt: Date;
}
