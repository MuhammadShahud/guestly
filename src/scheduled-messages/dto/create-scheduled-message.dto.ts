import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsMongoId,
  ArrayMinSize,
  IsArray,
  Validate,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OneDefaultTemplateValidator } from 'src/broadcast/validation/defaultTemplate.validator';
import {
  ScheduleMessageAction,
  ScheduleMessageStatus,
} from '../enum/schedule-message.enum';
import { IsValidDay } from '../validators/day.validator';

export class SMBodyVariableDto {
  @ApiProperty({
    description: 'Name of the variable',
    example: 'firstName',
  })
  @IsString()
  @IsNotEmpty({ message: 'variable_name is required' })
  variable_name: string;

  @ApiProperty({
    description: 'Value of the variable',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  value: string;
}

export class SchedulingDto {
  @IsString()
  @ApiProperty({
    description: 'Action to be scheduled',
    enum: Object.keys(ScheduleMessageAction),
    example: ScheduleMessageAction.BIRTHDATE,
  })
  @IsEnum(Object.keys(ScheduleMessageAction), {
    message: `{VALUE} is not supported, use ${Object.keys(ScheduleMessageAction)}.`,
  })
  @IsNotEmpty({ message: 'action is required' })
  action: string;

  @ApiProperty({
    description: 'Day of scheduling',
    example: 'Monday',
  })
  @ValidateIf((o) => o.action !== ScheduleMessageAction.BIRTHDATE)
  @IsString()
  @IsOptional()
  @IsValidDay({ message: 'Invalid day for the selected action' })
  day: string;

  @ApiProperty({
    description: 'Time of scheduling',
    example: '14:00',
  })
  @IsString()
  @IsOptional()
  time: string;
}

export class ScheduledMessageTemplateDto {
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
    type: [SMBodyVariableDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SMBodyVariableDto)
  body_variables: SMBodyVariableDto[];
}

export class CreateScheduledMessageDto {
  @ApiProperty({
    description: 'Name of the scheduled message',
    example: 'Welcome Message',
  })
  @IsString()
  @IsNotEmpty({ message: 'Please provide a name' })
  name: string;

  // @ApiProperty({
  //   description: 'List of Contact segment ID',
  //   example: ['seg1', 'seg2'],
  //   type: [String],
  // })
  // @IsArray()
  // @IsString({ each: true })
  // contact_segments: string[];

  @ApiProperty({
    description: 'List of templates used in the ScheduledMessage',
    type: [ScheduledMessageTemplateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Validate(OneDefaultTemplateValidator)
  @Type(() => ScheduledMessageTemplateDto)
  templates: ScheduledMessageTemplateDto[];

  @ApiProperty({
    description: 'Business ID',
    example: '60dfef1e2a3f2c1b7d4df13b',
  })
  @IsMongoId()
  @IsNotEmpty({ message: 'business id is required' })
  business: string;

  @ApiProperty({
    description: 'Status of the message',
    enum: Object.keys(ScheduleMessageStatus),
    example: ScheduleMessageStatus.SCHEDULED,
  })
  @IsEnum(Object.keys(ScheduleMessageStatus), {
    message: '{VALUE} is not supported.',
  })
  @IsOptional()
  status: string;

  @ApiProperty({
    description: 'Scheduling information',
  })
  @ValidateNested()
  @Type(() => SchedulingDto)
  @IsNotEmpty({ message: 'scheduling is required' })
  scheduling: SchedulingDto;
}
