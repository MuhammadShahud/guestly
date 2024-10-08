import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsMongoId,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OneDefaultTemplateValidator } from 'src/broadcast/validation/defaultTemplate.validator';
import { CampaignStatus } from '../enums/campaign.emun';

export class CampaignBodyVariableDto {
  @ApiProperty({
    description: 'Name of the body variable',
    example: 'firstName',
  })
  @IsString()
  @IsNotEmpty({ message: 'variable_name is required' })
  variable_name: string;

  @ApiProperty({
    description: 'Value of the body variable',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  value: string;
}

export class CampaignSchedulingDto {
  @ApiProperty({
    description: 'Date for scheduling the campaign',
    example: '2024-10-01',
  })
  @IsString()
  @IsOptional()
  date: string;

  @ApiProperty({
    description: 'Time for scheduling the campaign',
    example: '14:00',
  })
  @IsString()
  @IsOptional()
  time: string;
}

export class CampaignTemplateDto {
  @ApiProperty({
    description: 'Template content',
    example: '66f58cd0cd4cf1a3351079ce',
  })
  @IsString()
  template: string;

  @ApiProperty({
    description: 'Language of the template',
    example: 'en',
  })
  @IsString()
  language: string;

  @ApiProperty({
    description: 'Mark template as defaultl',
    example: 'false',
  })
  @IsBoolean()
  is_default: boolean;

  @ApiProperty({
    description: 'List of body variables used in the template',
    type: [CampaignBodyVariableDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignBodyVariableDto)
  body_variables: CampaignBodyVariableDto[];
}

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Name of the campaign',
    example: 'Summer Promo Campaign',
  })
  @IsString()
  @IsNotEmpty({ message: 'Please provide a name' })
  name: string;

  @ApiProperty({
    description: 'List of Contact segment ID',
    example: ['seg1', 'seg2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  contact_segments: string[];

  @ApiProperty({
    description: 'List of templates used in the Campaign',
    type: [CampaignTemplateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Validate(OneDefaultTemplateValidator)
  @Type(() => CampaignTemplateDto)
  templates: CampaignTemplateDto[];

  @ApiProperty({
    description: 'Business ID',
    example: '60dfef1e2a3f2c1b7d4df13c',
  })
  @IsMongoId()
  @IsNotEmpty({ message: 'Business id is required' })
  business: string;

  @ApiProperty({
    description: 'Status of the campaign',
    enum: Object.keys(CampaignStatus),
    example: 'DRAFT',
  })
  @IsEnum(Object.keys(CampaignStatus), { message: '{VALUE} is not supported.' })
  @IsOptional()
  status: string;

  err_message: string;

  @ApiProperty({
    description: 'Scheduling details for the campaign',
  })
  @ValidateNested()
  @Type(() => CampaignSchedulingDto)
  @IsNotEmpty({ message: 'Scheduling is required' })
  scheduling: CampaignSchedulingDto;
}
