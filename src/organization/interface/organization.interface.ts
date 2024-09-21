import { Document } from 'mongoose';
import { IAddress } from './address.interface';
import { ISubscription } from './subscription.interface';
import { IUser } from 'src/user/interfaces/user.interface';
import { IBuisness } from 'src/buisness/interface/buisness.interface';

export interface IOrganization extends Document {
  buisness: IBuisness[];
  users: IUser[];
  owner: IUser;
  subscription: ISubscription;
  active:
    | 'subscription-pending'
    | 'active'
    | 'user-deactivated'
    | 'system-deactivated'
    | 'package-expired'
    | 'package-cancelled';
}
