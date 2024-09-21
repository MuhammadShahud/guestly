import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SwitchBuisnessDto {
  @ApiProperty({
    description: 'selexted _id of buisness',
  })
  @IsNotEmpty({ message: 'Please provide buisnessId' })
  @IsString()
  bussinessId: string;
}
