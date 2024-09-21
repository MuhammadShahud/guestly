import { Module, forwardRef } from '@nestjs/common';
import { BuisnessService } from './buisness.service';
import { BuisnessController } from './buisness.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BuisnessSchema } from './buisness.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { S3Storage } from 'src/utils/utils.s3';
import { ToolsIntegrationsModule } from 'src/tools-integrations/tools-integrations.module';
import { ToolsIntegrationsService } from 'src/tools-integrations/tools-integrations.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => ToolsIntegrationsModule),
    MongooseModule.forFeature([{ name: 'Buisness', schema: BuisnessSchema }]),
  ],
  controllers: [BuisnessController],
  providers: [BuisnessService, S3Storage],
  exports: [BuisnessService],
})
export class BuisnessModule {}
