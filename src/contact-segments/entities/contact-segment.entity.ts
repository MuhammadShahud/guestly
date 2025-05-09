import { Schema } from 'mongoose';

const conditionSchema = new Schema(
  {
    attribute: {
      type: String,
      required: [true, 'Condition attribute is required'],
    },
    operator: {
      type: String,
      required: [true, 'Condition operator is required'],
    },
    value: {
      type: String,
      // required: [true, 'Condition value is required'],
    },
    conditionStatus: {
      type: String,
      required: [true, 'Condition value is required'],
    },
  },
  { _id: false },
);

const conditionGroupSchema = new Schema(
  {
    conditions: {
      type: [conditionSchema],
      required: [true, 'Conditions array is required'],
    },
  },
  { _id: false },
);

const contactSegmentSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
    },
    conditions: {
      type: [conditionGroupSchema],
      required: [true, 'Conditions are required'],
      default: [],
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Buisness',
      required: [true, 'Conditions are required'],
    },
  },
  {
    timestamps: true,
  },
);

export { contactSegmentSchema };
