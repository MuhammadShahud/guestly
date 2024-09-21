import { Document } from 'mongoose';

export interface IPackage extends Document {
  readonly main: string;
  readonly sub: 'view' | 'create' | 'update' | 'delete';
}
