import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.starategy';
import { S3Storage } from 'src/utils/utils.s3';
import { EmailService } from 'src/utils/utils.emailService';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/user.entity';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { UtilModule } from 'src/utils/utils.module';
import { UserService } from 'src/user/user.service';
import { SendGridService } from 'src/utils/utils.sendGridService';
import { AppConfigModule } from 'src/app-config/app-config.module';
@Module({
  imports: [
    OrganizationModule,
    AppConfigModule,
    forwardRef(() => UtilModule),
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    S3Storage,
    EmailService,
    SendGridService,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
