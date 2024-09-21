import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class VerifyOtp {
  @IsNotEmpty({ message: 'Please provide email' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Please provide OTP' })
  @IsNumber()
  code: number;
}
