import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { IOrganization } from 'src/organization/interface/organization.interface';
import { OrganizationService } from 'src/organization/organization.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IUser } from 'src/user/interfaces/user.interface';
import { UserService } from 'src/user/user.service';
import { PaymentRequiredException } from 'src/utils/paymentException';
import { EmailService } from 'src/utils/utils.emailService';
import { UtilsStripeService } from 'src/utils/utils.stripeService';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ConfirmLoginDto } from './dto/confirm-login-dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { ForgetPasswordDto } from './dto/forget-password-dto';
import { LoginDto } from './dto/login-dto';
import { ResetOtpDto } from './dto/resend-otp-dto';
import { VerifyOtp } from './dto/verify-otp-dto';
import { error } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly stripeService: UtilsStripeService,
    private readonly emailService: EmailService,
  ) {}

  // =================== HELPERS ======================

  //verifyToken
  verifyjwt(token: string): Promise<[Error | null, any | null]> {
    return new Promise((resolve) => {
      jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET'),
        (err, decoded) => {
          if (err) {
            resolve([err, null]);
          } else {
            console.log('DECODED', decoded);
            resolve([null, decoded]);
          }
        },
      );
    });
  }
  // creating token
  async signToken(id: string): Promise<string> {
    const payload = { id };
    return jwt.sign(payload, this.configService.get<string>('JWT_SECRET'), {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
  }

  // sending user and token in response
  async createSignToken(user: IUser): Promise<{ user: IUser; token: string }> {
    const token: string = await this.signToken(user?._id);

    user.password = undefined;

    return { user, token };
  }

  // comparing password
  async comparepassword(
    password: string,
    passwordCompareWith: string,
  ): Promise<boolean> {
    return await compare(password, passwordCompareWith);
  }

  // transaction helper
  async handleSignupErrorFn(
    error: Error,
    createUserDto: CreateUserDto,
    user?: IUser,
    organization?: IOrganization,
  ) {
    const { cus } = createUserDto;

    const promise = [];

    if (!!cus) promise.push(this.stripeService.deleteStripeUser(cus));

    if (!!user) promise.push(this.userService.deleteUser(user?._id));

    if (!!organization)
      promise.push(
        this.organizationService.deleteOrganization(organization?._id),
      );

    await Promise.all(promise);

    throw new BadRequestException({
      message: error.message,
      code: 'bad_request',
    });
  }
  // =================== ADMIN/OWNERS/USERS   ONLY ======================

  // async ownerSignup(createUserDto: CreateUserDto) {
  //   const { email } = createUserDto;
  //   const _user: IUser = await this.userService.findUser(email);

  //   if (_user) throw new ConflictException('User already exist');

  //   // creating customer for stripe
  //   const [err, cus] = await this.stripeService.getCustomerKey(email);

  //   if (!!err) throw new InternalServerErrorException(err.message);
  //   createUserDto.cus = cus.id;

  //   // creatins uper admin
  //   createUserDto.role = 'super-admin';

  //   const [userError, user]: [Error, IUser] =
  //     await this.userService.createUser(createUserDto);

  //   if (!!userError) await this.handleSignupErrorFn(userError, createUserDto);

  //   // creating organization for the owner
  //   const [organizationError, organization]: [Error, IOrganization] =
  //     await this.organizationService.createOrganization(user?._id);

  //   if (!!organizationError)
  //     await this.handleSignupErrorFn(organizationError, createUserDto, user);

  //   // updating user with organization id
  //   user.organization = organization._id;
  //   await user.save();

  //   // creating otp for user
  //   const [otpError, otp]: [Error, Number] =
  //     await this.userService.userOtpHandler(user?._id, 'confirmation');

  //   if (otpError)
  //     await this.handleSignupErrorFn(
  //       organizationError,
  //       createUserDto,
  //       user,
  //       organization,
  //     );

  //   return {
  //     message: 'Email verification link has been sent to your email!',
  //   };
  //login

  async ownerSignup(createUserDto: CreateUserDto) {
    const { email, lang } = createUserDto;
    const _user: IUser = await this.userService.findUser(email);

    if (_user) {
      throw new ConflictException({
        message: 'User already exist',
        code: 'user_exist',
      });
    }

    // creating customer for stripe
    const [err, cus] = await this.stripeService.getCustomerKey(email);

    if (!!err)
      throw new InternalServerErrorException({
        message: err.message,
        code: 'internal_server_error',
      });
    createUserDto.cus = cus.id;

    const [userError, user]: [Error, IUser] =
      await this.userService.createUser(createUserDto);

    if (!!userError) await this.handleSignupErrorFn(userError, createUserDto);

    // creating organization for the owner
    const [organizationError, organization]: [Error, IOrganization] =
      await this.organizationService.createOrganization(user?._id);

    if (!!organizationError)
      await this.handleSignupErrorFn(organizationError, createUserDto, user);

    // updating user with organization id
    const [updateUserError, updateduser] =
      await this.userService.addOrganizationAndRoleToUser(
        user,
        organization._id,
      );

    if (!!updateUserError)
      await this.handleSignupErrorFn(
        updateUserError,
        createUserDto,
        user,
        organization,
      );
    // creating otp for user
    const [otpError, otp]: [Error, Number] =
      await this.userService.userOtpHandler(
        user?._id,
        'confirmation',
        null,
        null,
        lang,
      );

    if (otpError)
      await this.handleSignupErrorFn(
        organizationError,
        createUserDto,
        user,
        organization,
      );

    return { message: 'Email verification link has been sent to your email!' };
  }

  // async loginValidateForFirstTime(user: IUser, lang: string) {
  //   // const updatedUser = await this.userService.updateCurrentOrganization(user);

  //   if (user?.role.some((e) => e.role == 'super-admin') && !user.isVerified) {
  //     const [error, res] = await this.userService.userOtpHandler(
  //       user?._id,
  //       'confirmation',
  //       user?.email,
  //       null,
  //       lang,
  //     );
  //     if (!!error) throw new BadRequestException(error.message);
  //     throw new ForbiddenException(
  //       'You can not log in without verifying your email',
  //     );
  //   }
  //   if (!user.currentOrganization.subscription) {
  //     const tokenWithUser = await this.createSignToken(user);
  //     throw new PaymentRequiredException(
  //       'Please buy a subscription first',
  //       tokenWithUser,
  //     );
  //   }

  //   if (user?.currentOrganization.subscription.endDate < new Date()) {
  //     const tokenWithUser = await this.createSignToken(user);
  //     throw new PaymentRequiredException(
  //       'Your subscriptions has been expired',
  //       tokenWithUser,
  //     );
  //   }

  //   return this.createSignToken(user);
  // }

  async login(loginDto: LoginDto) {
    const { email, password, lang } = loginDto;

    // checking if user exist or not
    const user: IUser = await this.userService.findUser(email);

    // validating user credentials
    if (!user || !(await this.comparepassword(password, user?.password)))
      throw new BadRequestException({
        message: 'invalid email or password',
        code: 'invalid_creds',
      });

    if (user?.role.some((e) => e.role == 'super-admin') && !user.isVerified) {
      const [error, res] = await this.userService.userOtpHandler(
        user?._id,
        'confirmation',
        user?.email,
        null,
        lang,
      );
      if (!!error) throw new BadRequestException(error.message);
      throw new ForbiddenException(
        'You can not log in without verifying your email',
      );
    }
    if (!user.currentOrganization.subscription) {
      const tokenWithUser = await this.createSignToken(user);
      throw new PaymentRequiredException(
        'Please buy a subscription first',
        tokenWithUser,
      );
    }

    if (user?.currentOrganization.subscription.endDate < new Date()) {
      const tokenWithUser = await this.createSignToken(user);
      throw new PaymentRequiredException(
        'Your subscriptions has been expired',
        tokenWithUser,
      );
    }
    await this.userService.updateLastLogin(user._id);
    return await this.createSignToken(user);
  }

  async loginAsBusiness(  email: string) {
    const user = await this.userService.findUser(email);
    if (!user) throw new BadRequestException('User not found');
    return await this.createSignToken(user);
  }

  async confirmLogin(confirmLoginDto: ConfirmLoginDto) {
    const { email, code } = confirmLoginDto;

    const [error, user]: [Error, IUser] = await this.userService.verifyOtp(
      email,
      code,
      'confirmation',
    );

    if (!!error)
      throw new BadRequestException({
        message: error.message,
        code: 'bad_request',
      });
    return await this.createSignToken(user);
  }

  // =================== COMMON ======================

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const { email, lang } = forgetPasswordDto;
    const user: IUser = await this.userService.findUser(email);
    if (!user) {
      throw new NotFoundException({
        message: 'user doesnt exist',
        code: 'doesnt_exist',
      });
    }
    const token = await this.signToken(user._id);
    const [error, otp] = await this.userService.userOtpHandler(
      null,
      'forgotPassword',
      email,
      token,
      lang,
    );

    if (error) throw new BadRequestException(error.message);

    return {
      message: 'Verification Link has been send to your email',
    };
  }

  async verifyOtp(verifyOtp: VerifyOtp) {
    const { code, email } = verifyOtp;

    const [error, user]: [Error, IUser] = await this.userService.verifyOtp(
      email,
      code,
    );

    if (!!error) return false;

    return { message: 'OTP has been verified' };
  }
  async verifyToken(tokenId: string) {
    const [token, email] = tokenId.split('_');
    const _token = +token;
    const result = await this.userService.verifyOtp(
      email,
      _token,
      'confirmation',
    );
    if (!result) {
      return false;
    }
    return true;
  }

  async updateUserEmail(token: string) {
    const [error, user] = await this.verifyjwt(token);

    if (error) return false;

    await this.userService.changeEmail(user.id);

    return true;
  }

  async resendOtp(resetOtpDto: ResetOtpDto) {
    const { email, type, lang } = resetOtpDto;

    const [error, otp] = await this.userService.userOtpHandler(
      null,
      type,
      email,
      null,
      lang,
    );

    if (!!error)
      throw new BadRequestException({
        message: error.message,
        code: 'bad_request',
      });

    return { message: 'OTP has been sent to your email!' };
  }

  async changePassword(changePassword: ChangePasswordDto, header: string) {
    const token = header.split(' ')[1];

    const { password } = changePassword;
    const payload = await this.verifyjwt(token);
    const userId = payload['id'];
    const { email } = await this.userService.getUser(userId);
    const [error, user_aft]: [Error, IUser] =
      await this.userService.changePassword(password, email);

    if (!!error)
      throw new BadRequestException({
        message: error.message,
        code: 'bad_request',
      });

    return { message: 'password change successfully' };
  }

  // =================== PLATFORM ADMIN  ONLY ======================

  async createAdmin(createAdminDto: CreateAdminDto): Promise<IUser> {
    const { email } = createAdminDto;

    // checking if user exist or not
    const _user: IUser = await this.userService.findUser(email);

    if (_user)
      throw new ConflictException({
        message: 'User already exist',
        code: 'user_exist',
      });

    // creating admin
    const data = {
      ...createAdminDto,
      role: 'admin',
    };
    const [userError, user]: [Error, IUser] = await this.userService.createUser(
      data as CreateUserDto,
    );

    if (userError)
      throw new BadRequestException({
        message: userError.message,
        code: 'bad_request',
      });

    data.password = undefined;

    return user as IUser;
  }

  async adminLogin(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // checking if user exist or not
    const user: IUser = await this.userService.findUser(email);

    if (!user || !(await this.comparepassword(password, user?.password)))
      throw new BadRequestException({
        message: 'invalid email or password',
        code: 'invalid_creds',
      });

    // verifying the request is from admin
    // const adminValidation: boolean = validateRole(
    //   ['owner', 'ceo', 'marketing', 'sales', 'others', 'manager'],
    //   user?.role,
    // );

    // if (adminValidation) throw new BadRequestException('Not a user route');

    // returning user and token
    await this.userService.updateLastLogin(user._id);

    return this.createSignToken(user);
  }
}
