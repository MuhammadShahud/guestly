import { Document } from 'mongoose';
import { BroadcastStatus } from '../enum/broadcast.enum';

export interface BroadcastTemplate {
  template: string;
  language: string;
  is_default: boolean;
  body_variables: Array<{ variable_name: string; value: string }>;
}

export interface IBroadcast extends Document {
  bookings: string[];
  templates: BroadcastTemplate[];
  business: string;
  status: BroadcastStatus;
  createdAt: Date;
  updatedAt: Date;
}
