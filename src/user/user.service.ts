import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import mongoose, { Model } from 'mongoose';
import { AppConfigService } from 'src/app-config/app-config.service';
import { IAppConfig } from 'src/app-config/interface/app-config.interface';
import { BuisnessService } from 'src/buisness/buisness.service';
import { pagination } from 'src/common/interface/pagination';
import { ApiService } from 'src/utils/apiServise';
import { EmailService } from 'src/utils/utils.emailService';
import {
  _pagination,
  checkOtpExpiry,
  expireAtHandler,
  generateRandomPassword,
  generateSixDigitRandomNumber,
} from 'src/utils/utils.helper';
import { S3Storage } from 'src/utils/utils.s3';
import { SendGridService } from 'src/utils/utils.sendGridService';
import { ChangePasswordDto } from './dto/changePasword.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { EditInvitedUserDto } from './dto/edit-invited-user.dto';
import { IniteUserDto } from './dto/invite-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IData, IUser } from './interfaces/user.interface';
import { UpdateEmailDto } from './dto/update-email.dto';
import { SwitchBuisnessDto } from './dto/switch-dto';
import { UpdateInvitedUserDto } from './dto/update-invitedUser.dto';
import { ToolsIntegrationsService } from 'src/tools-integrations/tools-integrations.service';
import { UpdateWhatsappProfileDto } from './dto/update-whatsapp-profile.dto';
// import MailerLite from '@mailerlite/mailerlite-nodejs';
import { match } from 'assert';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly User: Model<IUser>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly sendgridService: SendGridService,
    private readonly buisnessService: BuisnessService,
    private readonly apiService: ApiService,
    private readonly appConfigService: AppConfigService,
    private readonly s3Storage: S3Storage,
    private readonly toolsIntegrationsService: ToolsIntegrationsService,
  ) {}

  // =================== HELPER SERVICES ======================
  async validateOtp(code: number, user: IUser): Promise<void> {
    if (!user.code)
      throw new BadRequestException({
        message:
          'An otp can be verified one time only!please request a new OTP',
        code: 'one_time_otp',
      });

    const validateOtp = checkOtpExpiry(user?.expireAt);
    if (!validateOtp)
      throw new BadRequestException({
        message: 'OTP has been expired',
        code: 'expired_otp',
      });

    if (code.toString() !== user?.code.toString())
      throw new BadRequestException({
        message: 'Invalid Otp',
        code: 'invalid_otp',
      });
  }

  async updateCurrentOrganization(user: IUser) {
    const data = await this.User.findOneAndUpdate(
      { _id: user?._id },
      {
        $set: {
          currentOrganization: user?.role[0].organization,
        },
      },
      { new: true },
    );

    return data;
  }

  async addOrganizationAndRoleToUser(
    user: IUser,
    orgaization: string,
  ): Promise<[Error, IUser]> {
    try {
      const role = {
        organization: orgaization,
        buisness: null,
        role: 'super-admin',
      };
      const updatedUser = await this.User.findOneAndUpdate(
        { _id: user?._id },
        {
          $addToSet: {
            organization: orgaization,
            role: role,
          },
          currentOrganization: orgaization,
        },
        { new: true },
      );
      return [null, updatedUser];
    } catch (error) {
      return [error, null];
    }
  }
  // =================== INJECTABLE SERVICES ======================

  // get user with password for auth
  async findUser(email: string): Promise<IUser> {
    const user: IUser = await this.User.findOne({ email: email })
      .select('+password')
      .lean();
    return user as IUser;
  }

  async getUserforstripe(cus: string) {
    const user = await this.User.findOne({ cus: cus });
    if (!user)
      throw new BadRequestException({
        message: 'No user found with this stipe customer Id',
        code: 'bad_request_cus',
      });

    return user;
  }

  // get user
  async getUser(userId: string, role?: string): Promise<IUser> {
    console.log('heloo');
    console.log(userId);
    const dbQuery = {
      _id: userId,
      ...(!!role && {
        role,
      }),
    };
    const user: IUser = await this.User.findOne(dbQuery);
    if (!user) {
      throw new NotFoundException({
        message: 'user doesnt exist',
        code: 'doesnt_exist',
      });
    }
    return user as IUser;
  }

  // delete user
  async deleteUser(userId: string): Promise<void> {
    await this.User.findByIdAndDelete(userId);

    return;
  }

  // delete user
  async deleteAccount(user: IUser): Promise<any> {
    await this.User.findOneAndDelete({ _id: user._id });

    return;
  }

  // add fcmtoken
  async addFcmToken(email: string, token: string): Promise<void> {
    if (!!email && !!token) {
      await this.User.updateOne(
        { email },
        {
          $addToSet: {
            fcmToken: token,
          },
        },
      );
    }
  }

  // remove fcmtoken
  async removeFcmToken(email: string, token: string): Promise<void> {
    if (!!email && !!token) {
      await this.User.updateOne(
        { email },
        {
          $push: {
            fcmToken: token,
          },
        },
      );
    }
  }

  // create user service
  async createUser(createuserDto: CreateUserDto): Promise<[Error, IUser]> {
    try {
      const user: IUser = await this.User.create(createuserDto);
      return [null, user as IUser];
    } catch (error) {
      return [error, null];
    }
  }

  // add otp to user
  async userOtpHandler(
    userId: string,
    emaiTemplate: string,
    email?: string,
    token?: string,
    lang?: string,
  ): Promise<[Error, Number]> {
    try {
      const dbQuery = {
        ...(!!userId && { _id: userId }),
        ...(!!email && { email: email }),
      };

      const user = await this.User.findOne(dbQuery);

      if (!user)
        throw new NotFoundException({
          message: 'user doesnt exist',
          code: 'doesnt_exist',
        });
      const otp: number = generateSixDigitRandomNumber();

      const expiresAt: Date = expireAtHandler();

      await this.User.findOneAndUpdate(dbQuery, {
        code: otp,
        expireAt: expiresAt,
      });
      if (emaiTemplate == 'confirm-email') {
        const data: IAppConfig = await this.appConfigService.getAppCongigData({
          'email.key': 'signup',
        });
        // const token = this.auth;
        const token = await jwt.sign(
          { id: user?._id },
          this.configService.get<string>('JWT_SECRET'),
          { expiresIn: '24h' },
        );
        const emailData = await data.email.template.find((e) => e.lang == lang);
        const verification_link =
          `https://dev-api.guestly.ai/api/v1/auth/change-userEmail/` +
          `${lang}/` +
          token;
        const templateId = this.configService.get('VERIFY_ACCOUNT_TEMPLATE');
        const [error, success] = await this.sendgridService.send(
          {
            to: user?.newEmail,
            templateId,
            subject: emailData.subject,
          },
          {
            verification_link,
            description1: emailData.description1,
            title: emailData.title,
            buttontext: emailData.buttontext,
            description2: emailData.description2,
            lang: emailData.lang,
          },
        );
        if (!!error) console.log(error.message);
      }
      if (emaiTemplate == 'confirmation') {
        const data: IAppConfig = await this.appConfigService.getAppCongigData({
          'email.key': 'signup',
        });
        const emailData = await data.email.template.find((e) => e.lang == lang);
        const verification_link =
          this.configService.get('Backend_URL') +
          `${lang}/` +
          otp +
          '_' +
          user.email;
        const templateId = this.configService.get('VERIFY_ACCOUNT_TEMPLATE');
        const [error, success] = await this.sendgridService.send(
          {
            to: user?.email,
            templateId,
            subject: emailData.subject,
          },
          {
            verification_link,
            description1: emailData.description1,
            title: emailData.title,
            buttontext: emailData.buttontext,
            description2: emailData.description2,
            lang: emailData.lang,
          },
        );
        if (!!error) console.log(error.message);
      }
      // FORGET_PASS__TEMPLATE
      if (emaiTemplate == 'forgotPassword') {
        const data: IAppConfig = await this.appConfigService.getAppCongigData({
          'email.key': 'forget-password',
        });
        const emailData = await data.email.template.find((e) => e.lang == lang);
        const verification_link = `https://dev.guestly.ai/${lang}/reset-password?token=${token}`;
        console.log(verification_link);
        const templateId = this.configService.get('FORGET_PASS__TEMPLATE');
        const [error, success] = await this.sendgridService.send(
          {
            to: user?.email,
            templateId,
            subject: emailData.subject,
          },
          {
            verification_link,
            description1: emailData.description1,
            title: emailData.title,
            buttontext: emailData.buttontext,
            description2: emailData.description2,
            lang: emailData.lang,
          },
        );
        if (!!error) console.log(error.message);
      }

      return [null, otp];
    } catch (error) {
      return [error, null];
    }
  }

  // verify user otp
  async verifyOtp(
    email: string,
    code: number,
    key?: string,
  ): Promise<[Error, IUser]> {
    try {
      const user: IUser = await this.findUser(email);
      console.log('THIS IS KEY', key);

      if (!user)
        throw new NotFoundException({
          message: 'user doesnt exist',
          code: 'doesnt_exist',
        });

      await this.validateOtp(code, user);

      const expiresAt: Date = expireAtHandler();

      const data = await this.User.findOneAndUpdate(
        { _id: user?._id },
        {
          $set: {
            expiresAt,
            ...(key === 'confirmation'
              ? { isVerified: true, code: null, expireAt: null }
              : {}),
          },
        },
        { new: true },
      );
      console.log('the updated uer', data);
      user.password = undefined;
      user.code = undefined;
      user.expireAt = undefined;

      return [null, data as IUser];
    } catch (error) {
      return [error, null];
    }
  }

  // change user password
  async changePassword(
    password: string,
    email: string,
    code?: number,
  ): Promise<[Error, IUser]> {
    try {
      const user: IUser = await this.User.findOne({ email });

      if (!user)
        throw new NotFoundException({
          message: 'user doesnt exist',
          code: 'doesnt_exist',
        });

      if (!!code) await this.validateOtp(code, user);

      const data: IUser = await this.User.findOneAndUpdate(
        { _id: user?._id },
        {
          code: null,
          expireAt: null,
        },
        {
          new: true,
        },
      );

      data.password = password;

      await data.save();

      data.password = undefined;

      return [null, data as IUser];
    } catch (error) {
      return [error, null];
    }
  }

  async getCode(code: string) {
    const redirect_uri = this.configService.get<string>('FB_REDIRECT_URI');
    const apiUrl = 'https://graph.facebook.com/v12.0/oauth/access_token';
    const params = {
      client_id: process.env.META_APP_ID,
      ...(!!redirect_uri && {
        redirect_uri: redirect_uri,
      }),
      client_secret: process.env.META_APP_SECRET,
      code,
    };
    const [error, response] = await this.apiService.getApi(
      apiUrl,
      null,
      params,
    );

    if (!!error)
      throw new BadRequestException({
        message: error.message,
        code: 'bad_request',
      });
    console.log('RESPONSE', response);

    return { response };
  }

  // invite user
  async ValidateUser(
    user: IUser,
    admin: IUser,
    lang?: string,
    existCheck?: boolean,
    role?: string,
  ) {
    if (admin?.currentBuisness?.users.includes(user?._id.toString()))
      throw new BadRequestException('User Already exist on your buisness');

    if (admin?.currentBuisness?.invitedUser.includes(user?._id))
      throw new BadRequestException('invitation already sent');

    if (admin?.currentBuisness?.removedUser?.includes(user?._id)) {
      await Promise.all([
        this.buisnessService.invitingRemovedUserInBusiness(
          user?._id,
          admin.currentBuisness._id,
        ),
        this.sendInvitationLink(
          user,
          lang,
          admin.currentBuisness._id,
          existCheck,
          admin.currentOrganization._id,
        ),
        this.updateUserhelper(
          { _id: user._id },
          {
            $addToSet: {
              role: {
                buisness: admin.currentBuisness._id,
                organization: admin.currentOrganization._id,
                role: role,
              },
            },
          },
        ),
      ]);

      return { message: 'the removed user is invited again' };
    }

    await Promise.all([
      this.buisnessService.addOrDeleteInvitedUser(user, admin, true),
      this.sendInvitationLink(
        user,
        lang,
        admin.currentBuisness._id,
        existCheck,
        admin.currentOrganization._id,
      ),
      this.updateUserhelper(
        { _id: user._id },
        {
          $addToSet: {
            role: {
              buisness: admin.currentBuisness._id,
              organization: admin.currentOrganization._id,
              role: role,
            },
          },
        },
      ),
    ]);

    return { message: 'Invitation send successfully' };
  }

  async inviteUser(invitedUser: IniteUserDto, admin: IUser) {
    const { email, role, lang } = invitedUser;

    const user = await this.User.findOne({ email });

    if (user) return await this.ValidateUser(user, admin, lang, true, role);

    const password = generateRandomPassword(12);

    const newUser = await this.User.create({
      email,
      password,
      role: [
        {
          buisness: admin.currentBuisness._id,
          organization: admin.currentOrganization._id,
          role: role,
        },
      ],
      organization: [admin.currentOrganization],
      currentBuisness: admin.currentBuisness,
      currentOrganization: admin.currentOrganization,
    });

    await Promise.all([
      this.buisnessService.addOrDeleteInvitedUser(newUser, admin, true),
      this.sendInvitationLink(
        newUser,
        lang,
        admin.currentBuisness._id,
        false,
        admin.currentOrganization._id,
      ),
    ]);

    return { message: 'Initation send successfully' };
  }
  async switchBussiness(swithcBuisnessDto: SwitchBuisnessDto, user: IUser) {
    const { bussinessId } = swithcBuisnessDto;

    const buisness = await this.buisnessService.bussinessMemberCheck(
      bussinessId,
      user._id,
    );

    const updatedUser = await this.User.findOneAndUpdate(
      { _id: user?._id },
      {
        currentOrganization: buisness.organization._id,
        currentBuisness: buisness._id,
      },
      {
        new: true,
      },
    );
    return {
      data: updatedUser,
    };
  }
  async acceptingUser(token: string) {
    const data: any = jwt.verify(
      token,
      this.configService.get<string>('JWT_SECRET'),
      function (err, decoded) {
        if (err) {
          throw new UnauthorizedException(err);
        }
        console.log('DECODED', decoded);

        return decoded; // bar
      },
    );
    const { existCheck, id, businessId, email, removedUser, organizationId } =
      data;
    if (existCheck) {
      const updateCurrentBussiness = await this.User.findByIdAndUpdate(id, {
        currentBuisness: businessId,
      });
    }

    await this.buisnessService.acceptingUserInBusiness({
      id,
      businessId,
      orgaizationId: organizationId,
    });

    const verificationToken = this.signingForInvite({
      existCheck,
      _id: id,
      businessId,
      email,
    });
    return { existCheck, verificationToken, email };
  }
  signingForInvite(data: any) {
    const token = jwt.sign(data, this.configService.get('JWT_SECRET'));
    return token;
  }
  async acceptInvitationAfter(invitedUser: IniteUserDto, admin: IUser) {
    const { email, role, lang } = invitedUser;

    const user = await this.User.findOne({ email });
    console.log('user  ', user);
    if (user) return await this.ValidateUser(user, admin);

    const password = generateRandomPassword(12);

    const newUser = await this.User.create({
      email,
      password,
      role: [
        {
          buisness: admin.currentBuisness,
          currentOrganization: admin.currentOrganization,
          role: role,
        },
      ],
      organization: [admin.currentOrganization],
      currentBuisness: admin.currentBuisness,
      currentOrganization: admin.currentOrganization,
    });

    await this.buisnessService.addOrDeleteInvitedUser(newUser, admin, true);
    // will integarate mail apter getting the sendgrid template id

    return { message: 'Initation send successfully' };
  }

  // edit user-role
  async editUserRole(admin: IUser, editedInviteduserDto: EditInvitedUserDto) {
    const { role, userId } = editedInviteduserDto;

    if (
      admin?._id.toString() !== admin?.currentOrganization.owner._id.toString()
    )
      throw new UnauthorizedException(
        'You are not authorize to perform this action',
      );

    const user = await this.User.findById(userId);

    if (!user) throw new BadRequestException('No user found!');
    console.log(admin.currentOrganization._id);

    const updatedUser = await this.User.findOneAndUpdate(
      { _id: userId, 'role.organization': admin?.currentOrganization },
      {
        $set: { 'role.$.role': role },
      },
      { new: true },
    );

    return { data: updatedUser };
  }

  async deleteUserFromBuisness(userId: string, admin: IUser) {
    await this.buisnessService.addOrDeleteBuisnessUser(userId, admin, false);

    return { message: 'user succesfully removed' };
  }

  // update user
  async updateUser(user: IUser, updateUserDto: UpdateUserDto) {
    const { email } = updateUserDto;
    if (email) {
      updateUserDto.isVerified = false;
    }
    const data = await this.User.findOneAndUpdate(
      { _id: user._id },
      { ...updateUserDto, email },
      { new: true },
    );

    return { data };
  }

  async updateUserImage(user: IUser, imageFile: Express.Multer.File[]) {
    const uploadFiles = await this.s3Storage.uploadFiles(imageFile);
    // TODO:have to add the funtionality to delete the old image
    const image = uploadFiles?.image[0].Key;

    const data = await this.User.findOneAndUpdate(
      { _id: user._id },
      { image },
      { new: true },
    );

    return { data };
  }

  // add user in buisness
  async setCurrentBuisness(user: IUser, buisnessId: string) {
    await this.User.findOneAndUpdate(
      {
        _id: user._id,
        'role.organization': user?.currentOrganization,
      },
      {
        $set: {
          'role.$.buisness': new mongoose.Types.ObjectId(buisnessId),
          currentBuisness: buisnessId,
        },
      },
    );
  }

  async updateUserPassword(changePasswordDto: ChangePasswordDto, user: IUser) {
    const { password, currentPaswword } = changePasswordDto;
    const _user = await this.User.findOne({ _id: user?._id }).select(
      '+password',
    );
    if (!(await compare(currentPaswword, _user?.password))) {
      throw new BadRequestException('Wrong old password');
    }
    _user.password = password;

    await _user.save();

    return { message: 'password updated successfully' };
  }
  async sendInvitationLink(
    invitedUser: IUser,
    lang: string,
    businessId: string,
    existCheck: boolean,
    organizationId: string,
  ) {
    const data: IAppConfig = await this.appConfigService.getAppCongigData({
      'email.key': 'inviteUser',
    });
    const emailData = await data.email.template.find((e) => e.lang == lang);
    const { _id, email } = invitedUser;

    console.log(email, 'email');
    console.log(_id, '_id');

    const token = jwt.sign(
      { businessId, id: _id.toString(), existCheck, email, organizationId },
      this.configService.get('JWT_SECRET'),
    );
    console.log(token, 'token');
    const invitation_link = `https://dev-api.guestly.ai/api/v1/user/accpetUser/${lang}/${token}`;
    console.log(invitation_link);
    const templateId = this.configService.get('SEND_INVITATION_TEMPLATE');
    const [error, success] = await this.sendgridService.send(
      {
        to: email,
        templateId,
        subject: emailData.subject,
      },
      {
        invitation_link,
        description1: emailData.description1,
        title: emailData.title,
        buttontext: emailData.buttontext,
        description2: emailData.description2,
        lang: emailData.lang,
      },
    );
    if (!!error) console.log(error.message);
  }

  async findUers(
    userIds: string[],
    query: pagination,
    search: string,
    _users: string[],
    invitedUsers: string[],
    removedUser: string[],
  ) {
    const { limit, skip } = _pagination(query);

    const dbQuery = {
      _id: { $in: userIds },
      ...(!!search && {
        email: { $regex: search, $options: 'i' },
      }),
    };

    console.log(_users);

    const [
      users,
      count,
      totalUser,
      totalUserCount,
      totalInvitedUser,
      invitedUsercount,
      totalremovedUser,
      removedUsercount,
    ] = await Promise.all([
      this.User.find(dbQuery).skip(skip).limit(limit).sort('-createdAt'),
      this.User.countDocuments(dbQuery),

      this.User.find({ _id: { $in: _users } }).sort('-createdAt'),
      this.User.countDocuments({ _id: { $in: _users } }),

      this.User.find({ _id: { $in: invitedUsers } })
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'),
      this.User.countDocuments({ _id: { $in: invitedUsers } }),

      this.User.find({ _id: { $in: removedUser } })
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'),
      this.User.countDocuments({ _id: { $in: removedUser } }),
    ]);

    return {
      users,
      count,
      totalUser,
      totalUserCount,
      totalInvitedUser,
      invitedUsercount,
      totalremovedUser,
      removedUsercount,
    };
  }

  async deleteInvitedUser(userId: string, admin: IUser) {
    console.log(userId);
    const _user = await this.User.findById(userId);

    if (!_user) throw new BadRequestException('No user found');

    const data = await this.buisnessService.addOrDeleteUser(_user, admin);

    const removedRole = _user.role.find(
      (role) =>
        role.buisness.toString() == admin.currentBuisness._id.toString(),
    );

    const updatedUser = await this.User.findOneAndUpdate(
      { _id: _user.id },
      {
        $pull: {
          role: { buisness: removedRole.buisness },
        },
      },
      { new: true },
    );
    let updateObj = {};
    if (updatedUser.role.length > 0) {
      await this.User.findOneAndUpdate(
        { _id: _user._id },
        {
          currentBuisness: updatedUser.role[0].buisness,
          currentOrganization: updatedUser.role[0].organization,
        },
      );
    } else {
      await this.User.findOneAndUpdate(
        { _id: _user._id },
        {
          currentBuisness: null,
          currentOrganization: null,
          role: [],
          organization: [],
        },
      );
    }

    return { data };
  }

  async deleteBuisness(bussinessId: string, user: IUser) {
    // TODO:have to implement logic that only owner can delete bussiness
    const deleteBusinessandupdate = await this.buisnessService.remove(
      bussinessId,
      user,
    );

    return {
      message: 'buinsess deleted successfully',
      updatedBusiness: deleteBusinessandupdate,
    };
  }

  async updateEmail(updateEmailDto: UpdateEmailDto, user: IUser) {
    const { email, lang, password } = updateEmailDto;

    const passwordCheck = await this.User.findOne({ _id: user?._id }).select(
      '+password',
    );

    if (!(await compare(password, passwordCheck?.password)))
      throw new BadRequestException('Password does not match');

    const checkUser = await this.User.findOne({ email });

    if (checkUser) {
      const checkUserIdStr = checkUser._id.toString();
      const userIdStr = user._id.toString();

      if (checkUser.email === email && checkUserIdStr === userIdStr) {
        throw new BadRequestException(
          'New email address should be different from previous one',
        );
      }

      if (checkUserIdStr !== userIdStr) {
        throw new BadRequestException(
          'A user with the same email already exists',
        );
      }
    }

    const updatedUser = await this.User.findOneAndUpdate(
      { _id: user?._id },
      { newEmail: email },
      { new: true },
    );

    const [otpError, otp]: [Error, Number] = await this.userOtpHandler(
      updatedUser?._id,
      'confirm-email',
      null,
      null,
      lang,
    );

    if (otpError) {
      throw new BadRequestException('Failed to generate OTP');
    }

    return { message: 'email send successfully' };
  }

  async changeEmail(user: string) {
    const _user = await this.User.findById(user);

    _user.email = _user.newEmail;

    await _user.save();
  }

  async updateUserhelper(search: Object, params: Object) {
    return await this.User.findOneAndUpdate(search, params, { new: true });
  }

  async updateInvitedUserPassword(
    token: string,
    updateInvitedUserDto: UpdateInvitedUserDto,
  ) {
    const data: any = jwt.verify(
      token,
      this.configService.get<string>('JWT_SECRET'),
      function (err, decoded) {
        if (err) {
          throw new UnauthorizedException(err);
        }
        console.log('DECODED', decoded);

        return decoded; // bar
      },
    );
    const updatedUser = await this.updateUserhelper(
      { _id: data?._id },
      updateInvitedUserDto,
    );
    return updatedUser;
  }
  async updateLastLogin(userId: string) {
    await this.User.findByIdAndUpdate(
      userId,
      {
        lastLogin: new Date(),
      },
      { new: true },
    );
  }

  async getMetaBussinessAccId(token: string) {
    const graphApiUrl = this.configService.get('FACEBOOK_URL');
    const params = {
      access_token: token,
    };
    const apiUrl = `${graphApiUrl}/me/businesses?access_token=${token}`;
    const [error, response] = await this.apiService.getApi(
      apiUrl,
      null,
      params,
    );
    if (error) {
      throw new NotFoundException('no data found against this token');
    }

    const business = response['data'].find((record: Object) => {
      return record['name'] === 'Guestly';
    });

    return response;
  }

  async getMetaWhatsappAccId(token: string, user: IUser) {
    console.log('===========getMetaWhatsappAccId', token);
    const metabusinessId = this.configService.get(
      'GUESTLY_FACEBOOK_BUSINESS_ID',
    );
    const graphApiUrl = this.configService.get('FACEBOOK_URL');
    const params = {
      access_token: token,
    };
    const apiUrl = `${graphApiUrl}/${metabusinessId}/client_whatsapp_business_accounts`;
    console.log(apiUrl);
    const [error, response] = await this.apiService.getApi(
      apiUrl,
      { Authorization: `Bearer ${token}` },
      params,
    );
    if (response['data'].length <= 0) {
      throw new NotFoundException('NO business found');
    }
    if (error) {
      console.log(error);
      throw new NotFoundException('no data found against this token');
    }

    const WA_business = response['data'][0];

    const fetchWhatsappNumber = await this.getWhatsappNumber(
      WA_business?.id,
      token,
      graphApiUrl,
    );

    const WA_number = fetchWhatsappNumber['data'][0];

    const whatsAppProfileDetails = await this.getWhatsAppProfileDetails(
      WA_number?.id,
      token,
      graphApiUrl,
    );

    const WA_profile = whatsAppProfileDetails['data'][0];

    const WA_obj = {
      whatappAccountId: WA_business.id,
      phoneNumber: WA_number.display_phone_number,
      codeVerificationStatus: WA_number.code_verification_status,
      qualityRating: WA_number.quality_rating,
      phoneNumberId: WA_number.id,
      logo: WA_profile['profile_picture_url'],
      description: WA_profile['description'],
      address: WA_profile['address'],
      website: WA_profile['websites'],
      category: WA_profile['vertical'],
    };
    console.log(WA_obj, '===================WA_obj');

    console.log(user.currentBuisness.id, '==============currentBuisness._id');

    await this.toolsIntegrationsService.updateTandI(
      { buisness: user.currentBuisness.id },
      {
        $set: {
          whatsapp: WA_obj,
        },
      },
    );

    await this.buisnessService.updateBuisnessHelper(
      { _id: user.currentBuisness.id },
      { whatsappConfigured: true },
    );

    return {
      message: 'The Id is fetched successfully',
      response,
    };
  }

  async updateOwnerWhatsappProfile(
    updateWhatsappProfileDto: UpdateWhatsappProfileDto,
  ) {}

  async getWhatsappNumber(
    whatsappAccId: string,
    token: string,
    graphApiUrl: string,
  ) {
    const params = {
      access_token: token,
    };
    const apiUrl = `${graphApiUrl}/${whatsappAccId}/phone_numbers`;
    console.log(apiUrl);
    const [error, response] = await this.apiService.getApi(
      apiUrl,
      { Authorization: `Bearer ${token}` },
      params,
    );
    if (error) {
      return undefined;
    }
    console.log(response['data'][0].display_phone_number);
    return response;
  }

  async getWhatsAppProfileDetails(
    phoneNumberId: string,
    token: string,
    graphApiUrl: string,
  ) {
    const params = {
      access_token: token,
    };
    const apiUrl = `${graphApiUrl}/${phoneNumberId}/whatsapp_business_profile?fields=address,description,profile_picture_url,websites,vertical`;
    const [error, response] = await this.apiService.getApi(
      apiUrl,
      { Authorization: `Bearer ${token}` },
      params,
    );
    if (error) {
      return undefined;
    }
    console.log(response['data']);
    return response;
  }
  // async mailerLite() {
  //   const mailerlite = new MailerLite({
  //     api_key: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMjIxZDE3ZmUyNDhjOTkzZWIyZjU0ODljYmQyZjQ2ODU5MjdmODYyZjYwZDljMDc0NDQzOGRhMzUzYzJkNWVkM2UzODcwNDI4NTgyODcxZTkiLCJpYXQiOjE3MjUwNDExOTYuNzY0MDA4LCJuYmYiOjE3MjUwNDExOTYuNzY0MDEyLCJleHAiOjQ4ODA3MTQ3OTYuNzYxMDg4LCJzdWIiOiIxMDYwNzc0Iiwic2NvcGVzIjpbXX0.NA1sIIo-c0eLDcJOySFNSeP8_qL-uaFbFneNdrjMyCi9gRXaKV11NkxOh8ndt92XGnBqaNcaCThWM4I5BYzaTjBGt1PjMEbYkTNlp7oRLG2z-2m1JnNn2jn5C-zgW5YqfwwaiqUCY8TfWO7ocmp7GM4E0cQq9QcfYW5CqhPrqXen43tPRSqxA-Z5p1y6UTxa-hfyjxFk0-zcxuVybCesckCDt1-Ec0CT9lVB7gnPetdJy1n5R2SuV6VOm1Iqb5WaBr-xypCaPYRECnpkZfBfWvL8W9jGlXEgtMaURakWh9HWSDfdlhqk_Mqw1tqvS7lf8A6vF_EplRo0FIOYChJm2WOESupKOADxW3pA5IVnAju4nkTyrkOcz79_9T-sze5--daxsZyEZu-w6QxUDkUIwgG6CNyF_YwjKKJ8MxwSjmEELqlATplWASC5eHudGzXYa4zpI0v_cn79HOgFqBlwxpG65jbwsNMvB_aJmvsbVHZYUe7KWOYtu5Pe6JWfp64GJBHvBmnnaNPy_sYs1yPFfNogu6vJ_qi87guSHxEWVGtovyxcOr12oH9vWSR_FUp6aFP1-TIgtrKroiN1uYY1bEFdWyCcjfupyuYwbh8K5jxVD1xcIkQP_ulF7k3ym2pFsAP5jMs1ARvhHYeKSLPaq-9mCwAS9Mtpidi4J_KH_-g"
  //   })
  //   // const result = await mailerlite.batches.send({
  //   //   requests: [
  //   //     {
  //   //       method: "POST",
  //   //       path: "/api/subscribers",
  //   //       body: { email: "abc@gmail.com", fields: { name: "abc" }, groups: ["130496344390370439"] }
  //   //     },
  //   //     {
  //   //       method: "POST",
  //   //       path: "/api/subscribers",
  //   //       body: { email: "some@gmail.com", fields: { name: "tester" }, groups: ["130496344390370430"] }
  //   //     }

  //   //   ]
  //   // })
  //   const subscribe = await mailerlite.subscribers.createOrUpdate({
  //     email: "abc@gmail.com",
  //     fields: {
  //       name: "abc",
  //       matchId: "5556f50f-3c10-4138-beb7-c55c415567c9",
  //       productUrl: "None",
  //       size: "34A",
  //       styleNumber: "TSLG-B1393",
  //       brandName: "Savage X Fenty",
  //       score: 98.3454677025,
  //       isDisliked: false,
  //       fmrTypes: [],
  //       isLiked: false,
  //       productImage: "https://cdn.savagex.com/media/images/products/BA1934997-0001/Flocked-Logo-Unlined-Demi-Bra-BA1934997-0001-laydown-600x800.jpg",
  //       colorHex: "",
  //       productDescription: "",
  //       subCategory: "Unlined Bras",
  //       sizeMap: "null",
  //       matchType: "SYSTEM_GENERATED",
  //       price: "",
  //       sizeType: "band_cup",
  //       matchOwner: "SXF",
  //       color: "",
  //       productId: "BA1934997-0001",
  //       productName: "Flocked Logo Unlined Demi Bra"
  //     },
  //   })
  //   console.log(subscribe.data)
  //   return subscribe.data

  // }
}
