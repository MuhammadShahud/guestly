import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Please provide name' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Please provide contactId' })
  @IsString()
  contactId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  info: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  dueDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  assignedTo: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  guestConversation: string;

  @ApiProperty()
  @IsOptional()
  tags: string[];

  @ApiProperty()
  @IsOptional()
  attachment: string[];
}
