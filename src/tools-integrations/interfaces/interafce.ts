import { Document } from 'mongoose';
import { IBuisness } from 'src/buisness/interface/buisness.interface';
import { TYPE, Category, CHAT_IN_LANG, VARIANT } from '../enums/category.enum';

type ChatIn = {
  phoneNumber: string;
  bubbleButton: string;
  bubbleMessage: string;
  chatInMessage: string;
  script: string;
  lang: CHAT_IN_LANG;
};

interface IWhatsapp {
  logo: string;
  phoneNumber: string;
  description: string;
  address: string;
  website: string;
  category: Category;
  acessToken: string;
  phoneNumberId: string;
  whatappAccountId: string;
}

export interface IToolsIntegration extends Document {
  buisness: IBuisness;
  type: TYPE;
  variant: VARIANT;
  whatsapp: IWhatsapp;
  chatIn: ChatIn[];
}

export interface IAllToolsIntegration extends Document {
  name: TYPE;
  logo: string;
  enabled: boolean;
  variant: VARIANT;
  category: string;
}
