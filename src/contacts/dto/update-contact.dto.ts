import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @IsNotEmpty({ message: 'please provide tagId' })
  @IsString()
  contactId: string;
}
