import { Module } from '@nestjs/common';
import { BroadcastController } from './broadcast.controller';
import { BroadcastService } from './broadcast.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BroadcastSchema } from './broadcast.entity';
import { ApiService } from 'src/utils/apiServise';
import { TemplateService } from 'src/templates/templates.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { ContactsModule } from 'src/contacts/contacts.module';
import { TemplatesModule } from 'src/templates/templates.module';
import { ToolsIntegrationsModule } from 'src/tools-integrations/tools-integrations.module';
@Module({
  imports: [
    AuthModule,
    ContactsModule,
    TemplatesModule,
    ToolsIntegrationsModule,
    MongooseModule.forFeature([{ name: 'Broadcast', schema: BroadcastSchema }]),
  ],
  controllers: [BroadcastController],
  providers: [BroadcastService, ApiService],
})
export class BroadcastModule {}
