import { Document } from 'mongoose';
import { IOrganization } from 'src/organization/interface/organization.interface';

type Template = {
  subject: string;
  lang: string;
  description1: string;
  title: string;
  buttontext: string;
  description2: string;
};
type EmailTemplate = {
  key: string;
  template: Template[];
};
export interface IAppConfig extends Document {
  //
  email: EmailTemplate;
}
