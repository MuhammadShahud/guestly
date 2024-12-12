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
  TemplateLanguage,
  TemplateStatusEnum,
} from '../enums/template.enum';
import { IsTemplateButtonsArray } from '../validator/buttons.validator';

class TemplateHeaderDto {
  @ApiProperty({
    example: 'text',
    description: 'The content type of the header',
    enum: TemplateContentTypeEnum,
    enumName: 'TemplateContentTypeEnum',
  })
  @IsString()
  @IsEnum(TemplateContentTypeEnum)
  @IsOptional()
  content_type?: string;

  @ApiProperty({
    example: 'Header content',
    description: 'The content value of the header',
  })
  @IsString()
  @IsOptional()
  content_value?: string;
}

class TemplateButtonDto {
  @ApiProperty({
    example: TemplateButtonTypeEnum.URL,
    description: 'The type of the button',
    enum: TemplateButtonTypeEnum,
    enumName: 'TemplateButtonTypeEnum',
  })
  @IsString()
  @IsEnum(TemplateButtonTypeEnum)
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'Click me', description: 'The text of the button' })
  @IsString()
  @IsOptional()
  text?: string;

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
  @IsOptional()
  variable_name?: string;

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
    example: 'my_test_template',
    description: 'The name of the template',
  })
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsEnum(TemplateCategoryEnum)
  @ApiProperty({
    example: TemplateCategoryEnum.MARKETING,
    description: 'The category of the template',
    enum: TemplateCategoryEnum,
    enumName: 'TemplateCategoryEnum',
  })
  @IsString()
  @IsOptional()
  readonly category?: string;

  @ApiProperty({ example: 'en', description: 'The language of the template' })
  @IsString()
  @IsEnum(TemplateLanguage)
  @IsOptional()
  readonly language?: string;

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
    example: '<p>Hello{{1}}, World!</p>',
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
  // @IsTemplateButtonsArray({
  //   message:
  //     'Only one object of each type and only one of QUICK_REPLY or CALL_TO_ACTION can exist in the buttons array.',
  // })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateButtonDto)
  readonly buttons?: TemplateButtonDto[];

  @ApiProperty({
    description: 'The ID of the user who created the template',
    required: false,
    default: '66f012d025ad2e5c3d909ebc',
  })
  @IsOptional()
  @IsString()
  readonly business?: string;

  @ApiProperty({
    example: TemplateStatusEnum.DRAFT,
    description: 'The status of the template',
    enum: TemplateStatusEnum,
    enumName: 'TemplateStatusEnum',
    default: TemplateStatusEnum.DRAFT,
  })
  @IsOptional()
  @IsEnum(TemplateStatusEnum)
  readonly status?: string;
}
