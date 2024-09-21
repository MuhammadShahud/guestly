import { Schema } from 'mongoose';

const emailtemplate = new Schema({
  key: {
    type: String,
  },
  template: {
    type: [
      {
        subject: {
          type: String,
          default: '',
        },
        lang: {
          type: String,
        },
        description1: {
          type: String,
        },
        title: {
          type: String,
        },
        buttontext: {
          type: String,
        },
        description2: {
          type: String,
        },
      },
    ],
  },
});
const appConfig = new Schema({
  email: emailtemplate,
});

export { appConfig };
