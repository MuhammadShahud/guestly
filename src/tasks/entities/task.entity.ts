import { Schema } from 'mongoose';

const TaskSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'please provide name'],
    },
    info: {
      type: String,
      default: null,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contacts',
      required: [true, 'please provide bussiness Id'],
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in-progress', 'completed'],
        message: `{VALUE} is not supported.`,
        default: 'OPEN',
      },
    },
    description: {
      type: String,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    guestConversation: {
      type: String,
    },
    tags: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Tags',
          index: true,
        },
      ],
    },
    attachment: {
      type: [String],
      default: [],
    },
  },

  { timestamps: true },
);

export { TaskSchema };
