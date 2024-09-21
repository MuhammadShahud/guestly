import { Document } from 'mongoose';
import { IBuisness } from 'src/buisness/interface/buisness.interface';
import { IAddress } from 'src/organization/interface/address.interface';
import { ITag } from 'src/tags/interface.ts/tag.interface';

export interface IContact extends Document {
  name: string;
  surName: string;
  phoneNo: string;
  whatsAppId: string;
  email: string;
  language: string;
  gender: string;
  birthDate: Date;
  address: IAddress;
  tags: ITag[];
  buisness: IBuisness;
  marketinOptions: 'SUBSCRIBED' | 'NON-SUBSCRIBED' | 'UNSUBSCRIBED';
  MarketingOptInDate: Date;
  source: 'PMS' | 'WA' | 'User';
}
