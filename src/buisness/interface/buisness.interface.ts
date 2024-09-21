import { Document } from 'mongoose';
import { IAddress } from 'src/organization/interface/address.interface';
import { IOrganization } from 'src/organization/interface/organization.interface';
import { IUser } from 'src/user/interfaces/user.interface';

export interface IBuisness extends Document {
  companyName: string;
  companyType: string;
  email: string;
  website: string;
  companySize: string;
  pms: string;
  address: IAddress;
  phoneNo: string;
  taxIdNo: string;
  codice: string;
  invitedUser: IUser[];
  users: IUser[];
  removedUser: IUser[];
  organization: IOrganization;
  whatsappConfigured: Boolean;
  whatsAppAcoount: string[];
  integrationsAndTools: 'whatsapp' | 'asa' | 'xenus' | 'chat-ins';
  buisnessClassification: 'asa' | 'xenus' | 'other' | 'none';
}
