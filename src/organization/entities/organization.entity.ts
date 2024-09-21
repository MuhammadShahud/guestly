import { Schema } from 'mongoose';
import { AddressSchema } from './address.entity';
import { SubscriptionSchema } from './subscription.entity';

const OrganizationSchema = new Schema(
  {
    buisness: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Buisness',
        default: [],
      },
    ],
    subscription: { type: SubscriptionSchema, default: null },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    active: {
      type: String,
      enum: [
        'subscription-pending',
        'active',
        'user-deactivated',
        'system-deactivated',
        'package-expired',
        'package-cancelled',
        'none',
      ],
      default: 'none',
    },
  },
  { timestamps: true },
);

OrganizationSchema.pre(['find', 'findOne'], function () {
  this.populate([
    {
      path: 'buisness',
    },
  ]);
});

OrganizationSchema.pre(['findOneAndUpdate'], function () {
  this.populate([
    {
      path: 'buisness',
    },
  ]);
});
export { OrganizationSchema };
