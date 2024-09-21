import { Document } from 'mongoose';
import { IOrganization } from 'src/organization/interface/organization.interface';

export interface ITag extends Document {
  colorCode: string;
  tagName: string;
  organizationId: IOrganization;
  isActive: boolean;
}
