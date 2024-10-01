import { Document } from 'mongoose';
import { CampaignStatus } from '../enums/campaign.emun';

export interface ICampaign extends Document {
  name: string;
  contact_segment: string;
  template: string;
  language: string;
  body_variables: Array<{ variable_name: string; value: string }>;
  business: string;
  status: CampaignStatus;
  scheduling: { date: string; time: string };
  createdAt: Date;
  updatedAt: Date;
}
