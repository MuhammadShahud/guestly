import { Document } from 'mongoose';
import {
  TemplateButtonTypeEnum,
  TemplateCategoryEnum,
  TemplateContentTypeEnum,
} from '../enums/template.enum';
import { TemplateStatus } from 'aws-sdk/clients/migrationhuborchestrator';

interface ITemplateHeader {
  content_type: TemplateContentTypeEnum;
  content_value: string;
}

interface ITemplateButton {
  type: TemplateButtonTypeEnum;
  text: string;
  value?: string;
}

interface BodyVariableDto {
  variable_name: string; // Required field for the variable name
  default_value?: string; // Optional field for the default value
}

interface ITemplate extends Document {
  whatsAppTemplateId: string;
  name: string;
  category: TemplateCategoryEnum;
  language: string;
  header?: ITemplateHeader;
  raw_html_body?: string;
  body_variables?: BodyVariableDto[];
  footer?: string;
  buttons?: ITemplateButton[];
  business: string;
  status: TemplateStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export { ITemplate, ITemplateHeader, ITemplateButton };
