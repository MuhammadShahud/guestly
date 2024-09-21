import validator from 'validator';
import { Schema } from 'mongoose';
import { hash } from 'bcrypt';
import { compare } from 'bcryptjs';
import { USER_ROLE } from 'src/auth/enums/enums';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide your email'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      index: true,
    },
    newEmail: {
      type: String,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      index: true,
    },
    position: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      minlength: [8, 'Password is too short.'],
      required: [true, 'password is required'],
      select: false,
    },
    name: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      // required: [true, 'slug is required'],
    },
    role: {
      type: [
        {
          buisness: {
            type: Schema.Types.ObjectId,
            ref: 'Business',
            default: null,
          },
          organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
          },
          role: {
            type: String,
            trim: true,
            enum: {
              values: Object.values(USER_ROLE),
              message: `{VALUE} is not supported.`,
            },
            default: 'guestly-admin',
          },
        },
      ],
      default: [],
    },
    organization: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Organization',
          index: true,
        },
      ],
      default: [],
    },
    fcmToken: { type: [String], default: [] },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    active: {
      type: String,
      enum: {
        values: ['active', 'user-deactivated', 'user-blocked'],
        message: `{VALUE} is not supported.`,
      },
      default: 'active',
    },
    code: {
      type: Number,
      default: null,
    },
    currentBuisness: {
      type: Schema.Types.ObjectId,
      ref: 'Buisness',
      default: null,
    },
    currentOrganization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    currentRole: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    expireAt: { type: Date, default: null },
    cus: { type: String, default: null },
    pmId: { type: String, default: null },
    passwordChangedAt: Number,
    emailChangetAt: Number,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

UserSchema.pre(['find', 'findOne'], function () {
  if (this["options"] && this["options"].skipUserPopulation) {
    return;
  }
  console.log(this.model.modelName)
  this.populate([
    {
      path: 'organization',
      select: 'buisness subscription owner active',
    },
    {
      path: 'currentOrganization',
      select: 'buisness subscription owner active',
    },
    {
      path: 'currentBuisness',
      select:
        'buisness subscription owner active users invitedUser companyName companyType companySize pms image address phoneNo email website taxIdNo codice buisnessClassification',
    },
  ]);
});

UserSchema.pre(['findOneAndUpdate'], function () {
  this.populate([
    {
      path: 'organization',
      select: 'buisness subscription owner active',
    },
    {
      path: 'currentOrganization',
      select: 'buisness subscription owner active ',
    },
    {
      path: 'currentBuisness',
      select:
        'buisness subscription owner active users invitedUser companyName companyType companySize pms image address phoneNo email website taxIdNo codice buisnessClassification removedUser',
    },
  ]);
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, 12);
  next();
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.pre(['findOneAndUpdate'], async function (next) {
  const update = this.getUpdate();
  if (update['password']) {
    update['password'] = await hash(update['password'], 12);
  }
  next();
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('email') || this.isNew) return next();
  this.emailChangetAt = Date.now() - 1000;
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      new Date(this.passwordChangedAt).getTime() / 1000 + '',
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};
export { UserSchema };
