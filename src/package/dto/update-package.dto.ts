import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageDto } from './create-package.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
  @IsNotEmpty({ message: 'please provide id' })
  @IsMongoId()
  id: string;
}
