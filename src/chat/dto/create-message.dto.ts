import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { IsRequiredIf } from '../decorator/is-required-if.decorator';

enum MessageType {
  TEXT = 'text',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'Type of the message',
    example: 'text',
    enum: MessageType,
  })
  @IsNotEmpty()
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({
    description: 'ID of the user sending the message',
    example: '60d21b4667d0d8992e610c86',
  })
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @ApiProperty({
    description: 'ID of the room where the message is sent',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsNotEmpty()
  @IsMongoId()
  room: string;

  @ApiProperty({
    description: 'ID of the chat being replied to',
    example: '60d21b4667d0d8992e610c88',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  replyTo?: string;

  @ApiProperty({
    description: 'ID of the contact',
    example: '60d21b4667d0d8992e610c87',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  contact?: string;

  @ApiProperty({ description: 'Sender identifier', example: 'user1' })
  @IsNotEmpty()
  @IsString()
  from: string;

  @ApiProperty({ description: 'Receiver identifier', example: 'user2' })
  @IsNotEmpty()
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Indicates if the message is seen',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isSeen?: boolean;

  @ApiProperty({
    description: 'Indicates if the message is forwarded',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isForwarded?: boolean;

  @ApiProperty({ description: 'The message content', example: 'Hello there!' })
  @IsRequiredIf((dto: CreateMessageDto) => dto.type === MessageType.TEXT, {
    message: 'Message content is required for text type',
  })
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'URL of the image',
    example: 'http(s)://image-url',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'URL of the audio',
    example: 'http(s)://audio-url',
  })
  @IsRequiredIf((dto: CreateMessageDto) => dto.type === MessageType.AUDIO, {
    message: 'Audio URL is required for audio type',
  })
  @IsUrl()
  audioUrl?: string;

  @ApiProperty({
    description: 'URL of the video',
    example: 'http(s)://video-url',
  })
  @IsRequiredIf((dto: CreateMessageDto) => dto.type === MessageType.VIDEO, {
    message: 'Video URL is required for video type',
  })
  @IsUrl()
  videoUrl?: string;

  @ApiProperty({
    description: 'Caption for the video',
    example: 'Check out this video!',
  })
  @IsRequiredIf((dto: CreateMessageDto) => dto.type === MessageType.VIDEO, {
    message: 'Caption is required for video type',
  })
  @IsString()
  caption?: string;
}
