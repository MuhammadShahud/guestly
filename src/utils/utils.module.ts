import { Module, forwardRef } from '@nestjs/common';
import { UtilsStripeService } from './utils.stripeService';
import { PackageModule } from 'src/package/package.module';
import { PackagesService } from 'src/package/package.service';
@Module({
  imports: [forwardRef(() => PackageModule)],
  providers: [UtilsStripeService],
  exports: [UtilsStripeService],
})
export class UtilModule {}
