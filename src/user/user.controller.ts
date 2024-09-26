import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Redirect,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUser, Role } from 'src/common/decorators/user.decorater';
import { RoleGuard } from 'src/common/guards/role.guard';
import { ChangePasswordDto } from './dto/changePasword.dto';
import { EditInvitedUserDto } from './dto/edit-invited-user.dto';
import { IniteUserDto } from './dto/invite-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './interfaces/user.interface';
import { UserService } from './user.service';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth-decorater';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
import { USER_ROLE } from 'src/auth/enums/enums';
import { UpdateEmailDto } from './dto/update-email.dto';
import { SwitchBuisnessDto } from './dto/switch-dto';
import { UpdateInvitedUserDto } from './dto/update-invitedUser.dto';
@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @SwaggerDecorator('to get the login user data', true)
  @Get('get-me')
  @AuthDecorator(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.OTHERS)
  async getMe(@GetUser() user: IUser) {
    console.log('get user');
    return await this.userService.getUser(user._id);
  }

  @SwaggerDecorator('to invite user in buisness', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Post('invite-user')
  async inviteUser(@Body() invitedUser: IniteUserDto, @GetUser() user: IUser) {
    console.log('invite user');
    return await this.userService.inviteUser(invitedUser, user);
  }

  @SwaggerDecorator('update your email address', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch('update-email')
  async updateEmail(
    @Body() updateEmailDto: UpdateEmailDto,
    @GetUser() user: IUser,
  ) {
    // if (!email) throw new BadRequestException('Please provide email');

    // if (!lang) throw new BadRequestException('Please provide lang');

    return await this.userService.updateEmail(updateEmailDto, user);
  }

  @SwaggerDecorator('switch your buisness', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch('switch-bussiness')
  async switchBussiness(
    @Body() swithcBuisnessDto: SwitchBuisnessDto,
    @GetUser() user: IUser,
  ) {
    return await this.userService.switchBussiness(swithcBuisnessDto, user);
  }

  @SwaggerDecorator('edit the role of invited user', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch('edit-invited-user')
  async editUserRole(
    @Body() editedInviteduserDto: EditInvitedUserDto,
    @GetUser() user: IUser,
  ) {
    return await this.userService.editUserRole(user, editedInviteduserDto);
  }

  @SwaggerDecorator('update the login user', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch('update-me')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: IUser,
  ) {
    return await this.userService.updateUser(user, updateUserDto);
  }

  @Patch('update-user-image')
  @UseGuards(AuthGuard(), RoleGuard)
  @Role('super-admin')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async updateUserImage(
    @GetUser() user: IUser,
    @UploadedFiles() image: Express.Multer.File[],
  ) {
    return await this.userService.updateUserImage(user, image);
  }

  @SwaggerDecorator('update the login user', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  @Patch('change-password')
  async updateUserPassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: IUser,
  ) {
    return await this.userService.updateUserPassword(changePasswordDto, user);
  }

  @SwaggerDecorator('update the login user', true, true, 'code')
  @AuthDecorator(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  @Get('/whatsapp/:code')
  async getCode(@Param('code') code: string, @GetUser() user: IUser) {
    console.log(code, '=============');
    const codeResponse = await this.userService.getCode(code);

    return await this.userService.getMetaWhatsappAccId(
      codeResponse?.response['access_token'],
      user,
    );
  }

  @ApiExcludeEndpoint()
  @Redirect()
  @Get('accpetUser/:lang/:token')
  async acceptingUser(
    @Param('lang') lang: string,
    @Param('token') token: string,
  ) {
    console.log('TOKEN', token);

    const { existCheck, verificationToken, email } =
      await this.userService.acceptingUser(token);
    console.log(
      'this is the verification link',
      `https://dev.guestly.ai/${lang}/accept-invitation?email=${email}&token=${verificationToken}`,
    );

    if (!existCheck) {
      return {
        url: `https://dev.guestly.ai/${lang}/accept-invitation?email=${email}&token=${verificationToken}`,
        statusCode: 302,
      };
    }
    return {
      url: `https://dev.guestly.ai/${lang}/login`,
      statusCode: 302,
    };
  }

  @ApiExcludeEndpoint()
  @Patch('update-invitedUser-password/:lang/:token')
  async updateInvitedUserPassword(
    @Param('lang') lang: string,
    @Param('token') token: string,
    @Body() updateInvitedUserDto: UpdateInvitedUserDto,
  ) {
    return await this.userService.updateInvitedUserPassword(
      token,
      updateInvitedUserDto,
    );
  }

  @SwaggerDecorator('delete the login user', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  @Delete('delete-account')
  async deleteAccount(@GetUser() user: IUser) {
    return await this.userService.deleteAccount(user);
  }

  @SwaggerDecorator('remove a invited user from buisness', true, true, 'userId')
  @AuthDecorator(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  @Delete('remove-user/:userId')
  async deleteInvitedUser(
    @GetUser() user: IUser,
    @Param('userId') userId: string,
  ) {
    console.log(userId, 'userId');
    return await this.userService.deleteInvitedUser(userId, user);
  }

  @SwaggerDecorator('remove a user from buisness ', true, true, 'userId')
  @AuthDecorator(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  @Delete('remove-bussiness-user/:userId')
  async deleteBussinessUser(
    @GetUser() user: IUser,
    @Param('userId') userId: string,
  ) {
    console.log(userId, 'userId');
    return await this.userService.deleteUserFromBuisness(userId, user);
  }

  @SwaggerDecorator('delete a buisness', true, true, 'bussinessId')
  @AuthDecorator(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  @Delete('delete-bussiness/:bussinessId')
  async deleteBuisness(
    @GetUser() user: IUser,
    @Param('bussinessId') bussinessId: string,
  ) {
    return await this.userService.deleteBuisness(bussinessId, user);
  }

  @SwaggerDecorator('get meta Bussiness Acc Id ', true, true, 'token')
  @Get('get-whatsapp-bussiness-Id')
  async getMetaBussinessAccId(@Query('token') token: string) {
    return await this.userService.getMetaBussinessAccId(token);
  }

  @SwaggerDecorator('get meta whatsapp business Acc Id ')
  @Get('get-meta-whatsapp-acc-Id')
  @AuthDecorator(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  async getMetaWhatsappAccId(
    @GetUser() user: IUser,
    @Query('token') token: string,
  ) {
    return await this.userService.getMetaWhatsappAccId(token, user);
  }
  // @Get('mailerLite')
  // async mailerLite() {
  //   return await this.userService.mailerLite();
  // }
}
