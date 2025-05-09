import { Document } from 'mongoose';

export interface ScheduledMessageTemplate {
  template: string;
  language: string;
  is_default: boolean;
  body_variables: Array<{ variable_name: string; value: string }>;
}

export interface ScheduledMessage extends Document {
  name: string;
  templates: ScheduledMessageTemplate[];
  contact_segment: string[];
  business: string;
  status: string;
  scheduling: { action: string; day: string; time: string };
  scheduledQueueJobId: string;
}
