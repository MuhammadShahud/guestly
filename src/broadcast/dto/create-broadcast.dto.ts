import {
  IsMongoId,
  IsString,
  IsArray,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BroadcastStatus } from '../enum/broadcast.enum';

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

export class CreateBroadcastDto {
  @ApiProperty({
    description: 'List of contact IDs',
    type: [String],
    example: ['60dfef1e2a3f2c1b7d4df13a'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one contact is required' })
  @IsMongoId({ each: true })
  contacts: string[];

  @ApiProperty({
    description: 'Template ID',
    example: '60dfef1e2a3f2c1b7d4df13b',
  })
  @IsMongoId()
  @IsNotEmpty({ message: 'Template ID is required' })
  template: string;

  @ApiProperty({
    description: 'Language of the broadcast',
    example: 'en',
  })
  @IsString()
  @IsNotEmpty({ message: 'Language is required' })
  language: string;

  @ApiProperty({
    description: 'Body variables',
    type: [BodyVariableDto],
  })
  @ValidateNested({ each: true })
  @Type(() => BodyVariableDto)
  body_variables: BodyVariableDto[];

  @ApiProperty({
    description: 'Business ID',
    example: '60dfef1e2a3f2c1b7d4df13c',
  })
  @IsMongoId()
  @IsNotEmpty({ message: 'Business ID is required' })
  business: string;

  @ApiProperty({
    description: 'Status of the broadcast',
    enum: BroadcastStatus,
    default: BroadcastStatus.PENDING,
  })
  @IsEnum(BroadcastStatus, { message: `{VALUE} is not supported.` })
  status: BroadcastStatus;
}
