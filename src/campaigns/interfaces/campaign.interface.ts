import { Document } from 'mongoose';
import { CampaignStatus } from '../enums/campaign.emun';

export interface CampaignTemplate {
  template: string;
  language: string;
  is_default: boolean;
  body_variables: Array<{ variable_name: string; value: string }>;
}

export interface ICampaign extends Document {
  name: string;
  contact_segments: string[];
  templates: CampaignTemplate[];
  business: string;
  status: CampaignStatus;
  err_message: string;
  scheduling: { date: string; time: string };
  createdAt: Date;
  updatedAt: Date;
}