import { Schema } from 'mongoose';
import { AddressSchema } from 'src/organization/entities/address.entity';

const BuisnessSchema = new Schema(
  {
    companyName: {
      type: String,
      trim: true,
      default: null,
    },
    companyType: {
      type: String,
      trim: true,
      enum: {
        values: ['hotel', 'B2B', 'apartment', 'resort', 'camping'],
        message: `{VALUE} is not supported.`,
      },
      default: null,
    },
    companySize: {
      type: String,
    },
    pms: {
      type: String,
    },
    image: {
      type: String,
    },
    address: {
      type: AddressSchema,
      default: null,
    },
    phoneNo: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      default: null,
    },
    website: {
      type: String,
      trim: true,
      default: null,
    },
    taxIdNo: {
      type: String,
      trim: true,
      default: null,
    },
    codice: {
      type: String,
      trim: true,
      default: null,
    },
    buisnessClassification: {
      type: String,
      trim: true,
      enum: {
        values: ['', '1-star', '2-stars', '3-stars', '3s-stars', '4-stars', '4s-stars', '5-stars', '5s-stars', 'not-applicable'],
        message: `{VALUE} is not supported.`,
      },
      // required: [true, 'PMS is required'],
      default: null,
    },
    users: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    invitedUser: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    removedUser: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    organization: {
      type: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true,
      },
    },
    integrationsAndTools: {
      type: [String],
      enum: ['whatsapp', 'asa', 'xenus', 'chat-ins'],
      default: [],
    },
    whatsappConfigured: { type: Boolean, default: false },
    isOnBoarded: { type: Boolean, default: false },
    whatsAppAcoount: { type: [String], default: [] },
  },
  { timestamps: true },
);

BuisnessSchema.virtual('usersCount').get(function () {
  return this.users ? this.users.length : 0;
});

BuisnessSchema.virtual('invitedUsersCount').get(function () {
  return this.invitedUser ? this.invitedUser.length : 0;
});

BuisnessSchema.set('toJSON', { virtuals: true });
BuisnessSchema.set('toObject', { virtuals: true });

export { BuisnessSchema };
