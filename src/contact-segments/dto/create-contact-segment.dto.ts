import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConditionDto {
  @IsString()
  @IsNotEmpty()
  attribute: string;

  @IsString()
  @IsNotEmpty()
  operator: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  conditionStatus: string;
}

export class ConditionGroupDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions: ConditionDto[];
}

export class CreateContactSegmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionGroupDto)
  conditions: ConditionGroupDto[];

  @IsString()
  @IsNotEmpty()
  name: string;
}
