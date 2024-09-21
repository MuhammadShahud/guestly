import { Schema } from 'mongoose';
import { PermissionSchema } from 'src/common/entities/permission.entity';

const ConversationPerYear = new Schema({
  monthly: {
    type: Number,
    default: 0,
  },
  yearly: {
    type: Number,
    default: 0,
  },
});

const PackageSchema = new Schema(
  {
    // stripe and paypal use only
    packageId: { type: String, default: null },
    planId: { type: String, default: null },
    title: { type: String, default: '' },
    price: {
      type: Number,
      min: [0, 'Package price cannot be less than 0.'],
      required: [true, 'Package price is required.'],
    },
    description: { type: String, trim: true, default: '' },
    recurringType: {
      type: String,
      enum: ['month', 'year', 'weak', 'day', 'none'],
      default: 'month',
    },
    permissions: {
      type: [PermissionSchema],
      required: [true, 'Permissions are required'],
    },
    totalUsers: {
      type: Number,
      index: true,
      min: [0, 'Total Users allowed cannot be less than 0.'],
      default: 0,
    },
    totalBuisnessAccount: {
      type: Number,
      index: true,
      min: [0, 'Total Users allowed cannot be less than 0.'],
      default: 0,
    },
    totalBuisness: {
      type: Number,
      index: true,
      min: [0, 'Total Users allowed cannot be less than 0.'],
      default: 0,
    },
    conversationPerYear: {
      type: ConversationPerYear,
      default: null,
    },
    type: { type: String, enum: ['standard', 'trial'], default: 'standard' },

    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export { PackageSchema };
