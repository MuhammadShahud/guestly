import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsMongoId,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BodyVariableDto {
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

export class SchedulingDto {
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

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Name of the campaign',
    example: 'Summer Promo Campaign',
  })
  @IsString()
  @IsNotEmpty({ message: 'Please provide a name' })
  name: string;

  @ApiProperty({
    description: 'Contact segment ID',
    example: '60dfef1e2a3f2c1b7d4df13a',
  })
  @IsMongoId()
  @IsNotEmpty({ message: 'ContactSegment id is required' })
  contact_segment: string;

  @ApiProperty({
    description: 'Template ID',
    example: '60dfef1e2a3f2c1b7d4df13b',
  })
  @IsMongoId()
  @IsNotEmpty({ message: 'Template id is required' })
  template: string;

  @ApiProperty({
    description: 'Language of the campaign',
    example: 'en',
  })
  @IsString()
  @IsNotEmpty({ message: 'Please provide a language' })
  language: string;

  @ApiProperty({
    description: 'Body variables used in the campaign',
    type: [BodyVariableDto],
  })
  @ValidateNested({ each: true })
  @Type(() => BodyVariableDto)
  @ArrayMinSize(1, { message: 'At least one body variable is required' })
  body_variables: BodyVariableDto[];

  @ApiProperty({
    description: 'Business ID',
    example: '60dfef1e2a3f2c1b7d4df13c',
  })
  @IsMongoId()
  @IsNotEmpty({ message: 'Business id is required' })
  business: string;

  @ApiProperty({
    description: 'Status of the campaign',
    enum: ['Active', 'InActive'],
    example: 'Active',
  })
  @IsEnum(['Active', 'InActive'], { message: '{VALUE} is not supported.' })
  @IsOptional()
  status: string;

  @ApiProperty({
    description: 'Scheduling details for the campaign',
  })
  @ValidateNested()
  @Type(() => SchedulingDto)
  @IsNotEmpty({ message: 'Scheduling is required' })
  scheduling: SchedulingDto;
}
