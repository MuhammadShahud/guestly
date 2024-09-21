import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.entity';
import { EmailService } from 'src/utils/utils.emailService';
import { UtilModule } from 'src/utils/utils.module';
import { AuthModule } from 'src/auth/auth.module';
import { BuisnessModule } from 'src/buisness/buisness.module';
import { SendGridService } from 'src/utils/utils.sendGridService';
import { ApiService } from 'src/utils/apiServise';
import { AppConfigModule } from 'src/app-config/app-config.module';
import { S3Storage } from 'src/utils/utils.s3';
import { ToolsIntegrationsModule } from 'src/tools-integrations/tools-integrations.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    forwardRef(() => UtilModule),
    forwardRef(() => AuthModule),
    forwardRef(() => BuisnessModule),
    forwardRef(() => AppConfigModule),
    ToolsIntegrationsModule
  ],
  controllers: [UserController],
  providers: [UserService, EmailService, ApiService, SendGridService,S3Storage],
  exports: [UserService],
})
export class UserModule {}
