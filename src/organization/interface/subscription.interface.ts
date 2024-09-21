import { Document } from 'mongoose';
import { IPackage } from 'src/package/interface/package.interface';

export interface ISubscription extends Document {
  subscription: string;
  subscriptionId: string;
  plan: string;
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  packageId: IPackage;
  totalUsers: number;
  totalBuisnessAccount: number;
  totalBuisness: number;
  availableUsers: number;
  avaliableBuisnessAccount: number;
  availableBuisness: number;
  isActive: boolean;
}
