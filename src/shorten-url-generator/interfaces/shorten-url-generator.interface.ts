import { Document } from 'mongoose';

export interface IUrl extends Document {
  readonly original_url: string;
  readonly shorten_url: string;
}
