import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ConditionDto {
  @ApiProperty({
    description: 'The attribute that the condition is based on',
    example: 'age', // Example attribute
  })
  @IsString()
  @IsNotEmpty()
  attribute: string;

  @ApiProperty({
    description: 'The operator to be used for the condition',
    example: '>', // Example operator
  })
  @IsString()
  @IsNotEmpty()
  operator: string;

  @ApiProperty({
    description: 'The value to compare the attribute against',
    example: '18', // Example value
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'The status of the condition (e.g., active, inactive)',
    example: 'active', // Example condition status
  })
  @IsString()
  @IsNotEmpty()
  conditionStatus: string;
}

export class ConditionGroupDto {
  @ApiProperty({
    type: [ConditionDto],
    description: 'An array of conditions for the condition group',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions: ConditionDto[];
}

export class CreateContactSegmentDto {
  @ApiProperty({
    type: [ConditionGroupDto],
    description: 'An array of condition groups for the contact segment',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionGroupDto)
  conditions: ConditionGroupDto[];

  @ApiProperty({
    description: 'The name of the contact segment',
    example: 'My Contact Segment',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
