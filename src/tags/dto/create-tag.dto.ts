import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'color code of the tag',
    default: '#00000',
  })
  @IsNotEmpty({ message: 'please provide color code' })
  @IsString()
  colorCode: string;

  @ApiProperty({
    description: 'tag name',
    default: 'buisness 1',
  })
  @IsNotEmpty({ message: 'please provide tag name' })
  @IsString()
  tagName: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  bussinessId: string;
}
