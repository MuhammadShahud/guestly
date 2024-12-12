import { Document } from 'mongoose';

export interface ContactUs extends Document {
  readonly company: string;
  readonly first_name: string;
  readonly surname: string;
  readonly email: string;
  readonly phone_no: string;
  readonly notes: string;
  readonly pp_accepted: boolean;
}
