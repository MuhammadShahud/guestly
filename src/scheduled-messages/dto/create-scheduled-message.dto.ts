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
  @ApiProperty({
    description: 'Action to be scheduled',
    example: 'send',
  })
  @IsString()
  @IsNotEmpty({ message: 'action is required' })
  action: string;

  @ApiProperty({
    description: 'Day of scheduling',
    example: 'Monday',
  })
  @IsString()
  @IsOptional()
  day: string;

  @ApiProperty({
    description: 'Time of scheduling',
    example: '14:00',
  })
  @IsString()
  @IsOptional()
  time: string;
}

export class CreateScheduledMessageDto {
  @ApiProperty({
    description: 'Name of the scheduled message',
    example: 'Welcome Message',
  })
  @IsString()
  @IsNotEmpty({ message: 'Please provide a name' })
  name: string;

  @ApiProperty({
    description: 'Template ID',
    example: '60dfef1e2a3f2c1b7d4df13a',
  })
  @IsMongoId()
  @IsNotEmpty({ message: 'template id is required' })
  template: string;

  @ApiProperty({
    description: 'Language of the message',
    example: 'en',
  })
  @IsString()
  @IsNotEmpty({ message: 'Please provide a language' })
  language: string;

  @ApiProperty({
    description: 'Body variables used in the message',
    type: [BodyVariableDto],
  })
  @ValidateNested({ each: true })
  @Type(() => BodyVariableDto)
  @ArrayMinSize(1, { message: 'At least one body variable is required' })
  body_variables: BodyVariableDto[];

  @ApiProperty({
    description: 'Business ID',
    example: '60dfef1e2a3f2c1b7d4df13b',
  })
  @IsMongoId()
  @IsNotEmpty({ message: 'business id is required' })
  business: string;

  @ApiProperty({
    description: 'Status of the message',
    enum: ['Active', 'InActive'],
    example: 'Active',
  })
  @IsEnum(['Active', 'InActive'], { message: '{VALUE} is not supported.' })
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
