import { Document } from 'mongoose';

export interface ScheduledMessage extends Document {
  name: string;
  template: string;
  language: string;
  body_variables: Array<{ variable_name: string; value: string }>;
  business: string;
  status: string;
  scheduling: { action: string; day: string; time: string };
}
