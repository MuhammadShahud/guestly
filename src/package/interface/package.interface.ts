import { Document } from 'mongoose';

export type ConversationPerYear = {
  monthly: number;
  yearly: number;
};

export interface IPackage extends Document {
  packageId: string;
  planId: string;
  conversationPerYear: ConversationPerYear;
  title: string;
  price: number;
  permissions: string[];
  description: string;
  totalUsers: number;
  totalBuisnessAccount: number;
  totalBuisness: number;
  type: 'standard' | 'trial';
  active: boolean;
  recurringType: 'month' | 'year' | 'weak' | 'day' | 'none';
}
