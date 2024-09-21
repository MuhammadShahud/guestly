import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CHAT_IN_LANG } from '../enums/category.enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

class ChatIn {
  @ApiProperty({
    example: 'Click here',
    description: 'The text for the bubble button',
    default: 'Click here',
  })
  @IsNotEmpty({ message: 'Please provide bubble button' })
  @MinLength(1)
  @MaxLength(35)
  @IsString()
  bubbleButton: string;

  @ApiProperty({
    example: 'Welcome to our chat!',
    description: 'The message displayed in the bubble',
    default: 'Welcome to our chat!',
  })
  @IsNotEmpty({ message: 'Please provide bubble message' })
  @MinLength(1)
  @MaxLength(35)
  @IsString()
  bubbleMessage: string;

  @ApiProperty({
    example: 'How can we help you today?',
    description: 'The chat message',
    required: false,
    default: 'How can we help you today?',
  })
  @IsOptional()
  @MaxLength(128)
  @IsString()
  chatInMessage: string;

  @ApiProperty({
    example: '<script>...</script>',
    description: 'The custom script',
    required: false,
    default: '<script>...</script>',
  })
  @IsOptional()
  @IsString()
  script: string;

  @ApiProperty({
    example: 'EN',
    description: 'The language of the chat',
    enum: CHAT_IN_LANG,
    default: CHAT_IN_LANG.ENGLISH,
  })
  @IsNotEmpty({ message: 'Please provide language' })
  @IsIn(Object.values(CHAT_IN_LANG), {
    message: `only supported values are ${Object.values(CHAT_IN_LANG).join(', ')}`,
  })
  lang: CHAT_IN_LANG;
}

export class CreateChatIn {
  @ApiProperty({
    type: [ChatIn],
    description: 'The chat in body',
    default: ChatIn,
  })
  @IsNotEmpty({ message: 'please provide chat in body' })
  @Type(() => ChatIn)
  chatIn: ChatIn[];
}

export class UpdateChatInDto extends PartialType(CreateChatIn) {
  @IsNotEmpty({ message: 'please provide chat in id' })
  @IsString()
  chatInId: string;
}
