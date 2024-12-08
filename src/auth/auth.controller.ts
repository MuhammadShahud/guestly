import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ConfirmLoginDto } from './dto/confirm-login-dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { ForgetPasswordDto } from './dto/forget-password-dto';
import { LoginAsBusinessDto, LoginDto } from './dto/login-dto';
import { ResetOtpDto } from './dto/resend-otp-dto';
import { VerifyOtp } from './dto/verify-otp-dto';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =================== POST ROUTES ======================

  // =================== ADMIN/OWNER?USER ROUTES ======================
  @SwaggerDecorator('first time signup for a buisness')
  @Post('owner-signup')
  async ownerSignup(@Body() creatteUserDto: CreateUserDto) {
    return await this.authService.ownerSignup(creatteUserDto);
  }

  @SwaggerDecorator('login api for admin to login as the buisness')
  @Post('login-as-business')
  async loginAsBusiness(@Body() loginAsBusinessDto: LoginAsBusinessDto) {
    return await this.authService.loginAsBusiness(loginAsBusinessDto.email);
  }

  @SwaggerDecorator('login api for the buisness')
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @ApiExcludeEndpoint()
  @Post('confirm-login')
  async confirmLogin(@Body() confirmLoginDto: ConfirmLoginDto) {
    return await this.authService.confirmLogin(confirmLoginDto);
  }

  // =================== PLATFORM-ADMIN ROUTES ======================

  @ApiExcludeEndpoint()
  @Post('create-admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return await this.authService.createAdmin(createAdminDto);
  }

  @ApiExcludeEndpoint()
  @Post('admin-login')
  async adminLogin(@Body() loginDto: LoginDto) {
    return await this.authService.adminLogin(loginDto);
  }

  // =================== COMMON  ROUTES ======================
  @SwaggerDecorator('send an email to change forget password')
  @Post('forget-password')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return await this.authService.forgetPassword(forgetPasswordDto);
  }

  @ApiExcludeEndpoint()
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtp: VerifyOtp) {
    return await this.authService.verifyOtp(verifyOtp);
  }

  @ApiExcludeEndpoint()
  @Redirect()
  @Get('verify-token/:lang/:token')
  async verifyToken(
    @Param('lang') lang: string,
    @Param('token') token: string,
  ) {
    const isVerified = await this.authService.verifyToken(token);
    if (!isVerified) {
      return {
        url: `https://dev.guestly.ai/${lang}/register`,
        statusCode: 302,
      };
    }
    return {
      url: `https://dev.guestly.ai/${lang}/login?isEmailVerified=true`,
      statusCode: 302,
    };
  }

  @ApiExcludeEndpoint()
  @Redirect()
  @Get('change-userEmail/:lang/:token')
  async updateUserEmail(
    @Param('lang')
    lang: string,
    @Param('token') token: string,
  ) {
    const isVerified = await this.authService.updateUserEmail(token);
    if (!isVerified) {
      return {
        url: `https://dev.guestly.ai/${lang}/register`,
        statusCode: 302,
      };
    }
    return {
      url: `https://dev.guestly.ai/${lang}/login?isEmailVerified=true`,
      statusCode: 302,
    };
  }

  // @Get('forget-pass-verification/:token')
  // async verifyAuthToken(@Param('token') token: string) {
  //   await this.authService.adminLogin()
  // }

  @SwaggerDecorator('resend an email to change forget password')
  @Post('resend-otp')
  async resendOtp(@Body() resetOtpDto: ResetOtpDto) {
    return await this.authService.resendOtp(resetOtpDto);
  }
  @ApiExcludeEndpoint()
  @Post('change-password')
  async changePassword(
    @Body() changePassword: ChangePasswordDto,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('AUTH HWAD', authHeader);

    return await this.authService.changePassword(changePassword, authHeader);
  }
}
