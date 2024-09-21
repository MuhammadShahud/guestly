import { Module, forwardRef } from '@nestjs/common';
import { PackagesService } from './package.service';
import { PackageController } from './package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PackageSchema } from './entities/package.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UtilModule } from 'src/utils/utils.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UtilModule),
    forwardRef(() => OrganizationModule), // Import OrganizationModule
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: 'Package', schema: PackageSchema }]),
  ],
  controllers: [PackageController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackageModule {}
