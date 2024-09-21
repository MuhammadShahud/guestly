import { Document } from 'mongoose';

export interface IAddress extends Document {
  street: string;
  city: string;
  zip: string;
  country: string;
  province: string;
}
