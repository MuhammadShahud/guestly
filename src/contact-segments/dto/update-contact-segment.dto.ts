import { PartialType } from '@nestjs/mapped-types';
import { CreateContactSegmentDto } from './create-contact-segment.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateContactSegmentDto extends PartialType(CreateContactSegmentDto) {
    @IsString()
    @IsNotEmpty()
    contactSegmentId: string
}
