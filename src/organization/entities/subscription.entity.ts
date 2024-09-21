import { Schema } from 'mongoose';

const SubscriptionSchema = new Schema(
  {
    subscription: { type: String, default: null },
    subscriptionId: { type: String, default: null },
    plan: { type: String, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package', index: true },
    totalUsers: {
      type: Number,
      index: true,
      min: [0, 'Total Users allowed cannot be less than 0.'],
      default: 0,
    },
    totalBuisnessAccount: {
      type: Number,
      index: true,
      min: [0, 'Total Buisness Account  allowed cannot be less than 0.'],
      default: 0,
    },
    totalBuisness: {
      type: Number,
      index: true,
      min: [0, 'Total Buisness allowed cannot be less than 0.'],
      default: 0,
    },
    availableUsers: {
      type: Number,
      index: true,
      min: [0, 'Available Users allowed cannot be less than 0.'],
      default: 0,
    },
    avaliableBuisnessAccount: {
      type: Number,
      index: true,
      min: [0, 'Available Buisness Account allowed cannot be less than 0.'],
      default: 0,
    },
    availableBuisness: {
      type: Number,
      index: true,
      min: [0, 'Available Buisness allowed cannot be less than 0.'],
      default: 0,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export { SubscriptionSchema };
