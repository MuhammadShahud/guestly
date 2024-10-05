import { forwardRef, Global, Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { UtilsWhatsAppService } from 'src/utils/utils.whatsapp';
import { AuthModule } from 'src/auth/auth.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { ToolsIntegrationsModule } from 'src/tools-integrations/tools-integrations.module';
import { S3Storage } from 'src/utils/utils.s3';
import { ApiService } from 'src/utils/apiServise';
import { ChatModule } from 'src/chat/chat.module';
import { BuisnessModule } from 'src/buisness/buisness.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { BookingModule } from 'src/booking/booking.module';
import { TemplatesModule } from 'src/templates/templates.module';

@Global()
@Module({
  imports: [
    AuthModule,
    ContactsModule,
    ToolsIntegrationsModule,
    ChatModule,
    BuisnessModule,
    OrganizationModule,
    BookingModule,
    forwardRef(() => TemplatesModule),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, UtilsWhatsAppService, S3Storage, ApiService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
