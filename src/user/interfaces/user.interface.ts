import { Document } from 'mongoose';
import { IBuisness } from 'src/buisness/interface/buisness.interface';
import { IOrganization } from 'src/organization/interface/organization.interface';

type Role = {
  organization: IOrganization;
  buisness: string;
  role: string;
};
export interface IUser extends Document {
  name: string;
  email: string;
  newEmail: string;
  password: string;
  role: Role[];
  permissions: string[];
  organization: IOrganization[];
  fcmToken: string[];
  isOnline: boolean;
  isVerified: boolean;
  passwordChangedAt: number;
  emailChangetAt: number;
  code: string;
  cus: string;
  pmId: string;
  expireAt: Date;
  currentBuisness: IBuisness;
  currentOrganization: IOrganization;
  currentRole: string;
  active: 'active' | 'user-deactivated' | 'system-deactivated';
  correctPassword: (candidatePassword: string, userPassword: string) => boolean;
  changePasswordAfter: (candidatePassword: number) => boolean;
  createPasswordResetToken: () => string;
}

export interface IData {

  whatsappAccId: string;
  phoneNumber: string
}