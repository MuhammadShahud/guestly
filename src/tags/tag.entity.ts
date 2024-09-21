import { Schema } from 'mongoose';

const TagSchema = new Schema(
  {
    colorCode: {
      type: String,
      required: [true, 'please provide color code'],
    },
    tagName: {
      type: String,
      required: [true, 'please provide tag name'],
    },
    bussinessId: {
      type: Schema.Types.ObjectId,
      ref: 'Buisness',
      required: [true, 'please provide bussiness Id'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

TagSchema.pre(['find', 'findOne'], function () {
  this.populate([
    {
      path: 'bussinessId',
      select: 'buisness subscription owner active',
    },
  ]);
});

TagSchema.pre(['findOneAndUpdate'], function () {
  this.populate([
    {
      path: 'bussinessId',
      select: 'buisness subscription owner active',
    },
  ]);
});

export { TagSchema };
