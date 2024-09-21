import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOnBoardingDto {
  @IsNotEmpty({ message: 'please provide buisness id' })
  @IsString()
  buisnessId: string;

  @IsNotEmpty({ message: 'please provide isOnBoarded flag' })
  @IsBoolean()
  isOnBoarded: boolean;
}
