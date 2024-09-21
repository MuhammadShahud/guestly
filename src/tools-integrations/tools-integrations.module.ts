import { forwardRef, Module } from '@nestjs/common';
import { ToolsIntegrationsService } from './tools-integrations.service';
import { ToolsIntegrationsController } from './tools-integrations.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AllToolsAndIntegration, ToolsAndIntegration } from './tools-integration.entity';
import { BuisnessModule } from 'src/buisness/buisness.module';
import { BuisnessService } from 'src/buisness/buisness.service';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => BuisnessModule),
    MongooseModule.forFeature([
      { name: 'Tools-Integration', schema: ToolsAndIntegration },
      { name: 'AllToolsAndIntegration', schema: AllToolsAndIntegration },
    ]),
  ],
  controllers: [ToolsIntegrationsController],
  providers: [ToolsIntegrationsService],
  exports: [ToolsIntegrationsService], 

})
export class ToolsIntegrationsModule {}
