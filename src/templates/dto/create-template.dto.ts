import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  TemplateButtonTypeEnum,
  TemplateCategoryEnum,
  TemplateContentTypeEnum,
  TemplateStatusEnum,
} from '../enums/template.enum';

class TemplateHeaderDto {
  @ApiProperty({
    example: 'text',
    description: 'The content type of the header',
    enum: TemplateContentTypeEnum,
    enumName: 'TemplateContentTypeEnum',
  })
  @IsString()
  @IsEnum(TemplateContentTypeEnum)
  content_type: string;

  @ApiProperty({
    example: 'Header content',
    description: 'The content value of the header',
  })
  @IsString()
  content_value: string;
}

class TemplateButtonDto {
  @ApiProperty({
    example: 'QUICK_REPLY',
    description: 'The type of the button',
    enum: TemplateButtonTypeEnum,
    enumName: 'TemplateButtonTypeEnum',
  })
  @IsString()
  @IsEnum(TemplateButtonTypeEnum)
  type: string;

  @ApiProperty({ example: 'Click me', description: 'The text of the button' })
  @IsString()
  text: string;

  @ApiProperty({
    example: 'http://example.com',
    description: 'The value of the button',
    required: false,
  })
  @IsOptional()
  @IsString()
  value?: string;
}

class BodyVariableDto {
  @ApiProperty({ example: 'var1', description: 'The name of the variable' })
  @IsString()
  variable_name: string;

  @ApiProperty({
    example: 'defaultValue',
    description: 'The default value for the variable',
    required: false,
  })
  @IsOptional()
  @IsString()
  default_value?: string;
}

export class CreateTemplateDto {
  @ApiProperty({
    example: 'My Template',
    description: 'The name of the template',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'MARKETING',
    description: 'The category of the template',
    enum: TemplateCategoryEnum,
    enumName: 'TemplateCategoryEnum',
  })
  @IsString()
  @IsEnum(TemplateCategoryEnum)
  readonly category: string;

  @ApiProperty({ example: 'en', description: 'The language of the template' })
  @IsString()
  readonly language: string;

  @ApiProperty({
    description: 'The header of the template',
    required: false,
    type: TemplateHeaderDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateHeaderDto)
  readonly header?: TemplateHeaderDto;

  @ApiProperty({
    example: '<p>Hello, World!</p>',
    description: 'The raw HTML body of the template',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly raw_html_body?: string;
  @ApiProperty({
    description: 'The body variables of the template',
    required: false,
    type: [BodyVariableDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BodyVariableDto)
  readonly body_variables?: BodyVariableDto[];

  @ApiProperty({
    example: 'Footer text',
    description: 'The footer of the template',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly footer?: string;

  @ApiProperty({
    description: 'The buttons of the template',
    required: false,
    type: [TemplateButtonDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateButtonDto)
  readonly buttons?: TemplateButtonDto[];

  @ApiProperty({
    description: 'The ID of the user who created the template',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly user_id?: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'The status of the template',
    enum: TemplateStatusEnum,
    enumName: 'TemplateStatusEnum',
    required: false,
  })
  @IsOptional()
  @IsEnum(TemplateStatusEnum)
  readonly status?: string;
}
