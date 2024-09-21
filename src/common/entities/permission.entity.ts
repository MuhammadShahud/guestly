import { Schema } from 'mongoose';

const PermissionSchema = new Schema(
  {
    main: {
      type: String,
      enum: {
        values: [
          // will add all the enums here once we decided all the module
          'direct',
          'broadcast',
          'templates',
          'automations',
          'campaigns',
          'pms',
          'tools',
          'language',
        ],
      },
      required: [true, 'main permission is required'],
    },
    sub: {
      type: [String],
      enum: {
        values: ['view', 'create', 'update', 'delete'],
      },
    },
  },
  { timestamps: true },
);
export { PermissionSchema };
