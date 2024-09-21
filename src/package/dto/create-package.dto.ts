import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePermissionDto } from 'src/common/dto/permission-dto';

class ConversationPerYear {
  @IsOptional()
  @IsString()
  monthly: number;

  @IsOptional()
  @IsString()
  yearly: number;
}

export class CreatePackageDto {
  // data from user side
  @IsNotEmpty({ message: 'Please provide title!' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Please provide title!' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Please provide total number of users!!' })
  @IsNumber()
  totalUsers: number;

  @IsNotEmpty({ message: 'Please provide total number of users!!' })
  @IsNumber()
  totalBuisnessAccount: number;

  @IsNotEmpty({ message: 'Please provide total number of users!!' })
  @IsNumber()
  totalBuisness: number;

  @IsNotEmpty({ message: 'Please provide conversation per year' })
  @Type(() => ConversationPerYear)
  conversationPerYear: ConversationPerYear;

  @IsNotEmpty({ message: 'Please provide price!' })
  @IsNumber()
  price: number;

  @IsNotEmpty({ message: 'Please provide title!' })
  @IsIn(['month', 'year', 'weak', 'day', 'none'], {
    message: 'recurring type only support the value month , year , weak , day',
  })
  @IsString()
  recurringType: string;

  // permission dto
  @IsNotEmpty({ message: 'Please provide permission' })
  @Type(() => CreatePermissionDto)
  @ValidateNested({ each: true })
  permissions: CreatePermissionDto[];

  // data which will be created from server side
  @IsOptional()
  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  packageId: string;
}
