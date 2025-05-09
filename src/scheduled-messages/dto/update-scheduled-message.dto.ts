import { PartialType } from '@nestjs/swagger';
import { CreateScheduledMessageDto } from './create-scheduled-message.dto';

export class UpdateScheduledMessageDto extends PartialType(
  CreateScheduledMessageDto,
) {}
