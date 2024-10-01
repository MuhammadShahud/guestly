import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendBroadcastDto {
  @ApiProperty({
    description: 'The message content to be sent to contacts via WhatsApp',
    example: 'Hello, this is your notification!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  message: string;
}
