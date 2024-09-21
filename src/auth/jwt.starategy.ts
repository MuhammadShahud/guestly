import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUser } from 'src/user/interfaces/user.interface';
import { UserService } from 'src/user/user.service';
import { checkAfterConditon } from 'src/utils/utils.helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    const { id, iat } = payload;

    const user: IUser = await this.userService.getUser(id);
    if (!user)
      throw new UnauthorizedException(
        'the user belonging to this token does no longer exist ',
      );

    if (checkAfterConditon(iat, user?.passwordChangedAt))
      throw new UnauthorizedException(
        'User recently changed password please login again ',
      );

    if (checkAfterConditon(iat, user?.emailChangetAt))
      throw new UnauthorizedException(
        'User recently changed email please login again ',
      );

    if (['user-deactivated', 'user-blocked'].includes(user?.active))
      throw new UnauthorizedException('Your account has been deactivated');

    return user;
  }
}
