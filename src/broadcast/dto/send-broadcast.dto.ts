import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TBodyVariableDto {
  @ApiProperty({
    description: 'Name of the variable in the template',
    example: 'userName',
  })
  @IsString()
  variable_name: string;

  @ApiProperty({
    description: 'Value of the variable',
    example: 'John Doe',
  })
  @IsString()
  value: string;
}

export class BroadcastTemplateDto {
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
    type: [TBodyVariableDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TBodyVariableDto)
  body_variables: TBodyVariableDto[];
}
