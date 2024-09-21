import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContactCommentDto {
  @ApiProperty({
    default: 'this is a comment',
  })
  @IsNotEmpty({ message: 'please provide comment' })
  @MaxLength(400)
  @IsString()
  comment: string;

  @ApiProperty({
    default: '6695f36ef991b1d993fc0512',
  })
  @IsNotEmpty({ message: 'please provide comment' })
  @IsString()
  contactId: string;

  @IsOptional()
  @IsString()
  user: string;
}

export class UpdateContactCommentDto extends PartialType(CreateContactCommentDto) {
  @ApiProperty({
    default: '6695f36ef991b1d993fc0512',
  })
  @IsNotEmpty({ message: 'please provide commentId' })
  @IsString()
  commentId: string;
}
