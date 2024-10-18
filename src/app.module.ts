import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DatabaseModule } from './common/database/database.module';
import { LoggerMiddleware } from './utils/logger.middleware';
import { UserModule } from './user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { ForbiddenExceptionFilter } from './utils/utils.ForbiddenException';
import { InternalServerExceptionFilter } from './utils/utils.internalServerException';
import { UnauthorizeExceptionFilter } from './utils/utils.unauthorizedExceptionFilter';
import { BadRequestExceptionFilter } from './utils/utils.badRequestExceptionFilter';
import { NotificationModule } from './notification/notification.module';
import { AnyExceptionFilter } from './utils/utils.AnyExceptionFilter';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { UtilModule } from './utils/utils.module';
import { PackageModule } from './package/package.module';
import { SocketModule } from './socket/socket.module';
import { EmailService } from './utils/utils.emailService';
import { SendGridService } from './utils/utils.sendGridService';
import { AppConfigModule } from './app-config/app-config.module';
import { TagsModule } from './tags/tags.module';
import { ToolsIntegrationsModule } from './tools-integrations/tools-integrations.module';
import { ContactsModule } from './contacts/contacts.module';
import { BookingModule } from './booking/booking.module';
import { TasksModule } from './tasks/tasks.module';
// import { SentryModule } from '@sentry/nestjs/setup';
import { ContactSegmentsModule } from './contact-segments/contact-segments.module';
import { ChatModule } from './chat/chat.module';
import { UtilsWhatsAppService } from './utils/utils.whatsapp';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { S3Storage } from './utils/utils.s3';
import { TemplatesModule } from './templates/templates.module';
import { ScheduledMessagesModule } from './scheduled-messages/scheduled-messages.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { BroadcastModule } from './broadcast/broadcast.module';
import { BullModule } from '@nestjs/bull';
import { ShortenUrlGeneratorModule } from './shorten-url-generator/shorten-url-generator.module';
import { ContactUsModule } from './contact-us/contact-us.module';

const envFilePath: string = join(
  __dirname,
  '..',
  'configs',
  `config.${process.env.NODE_ENV}.env`,
);

console.log(envFilePath);

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6380),
          password: configService.get<string>('REDIS_PASSWORD'), // Optional
        },
      }),
      inject: [ConfigService],
    }),
    // SentryModule.forRoot(),
    ConfigModule.forRoot({
      // envFilePath
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    SocketModule,
    UserModule,
    NotificationModule,
    AuthModule,
    OrganizationModule,
    UtilModule,
    PackageModule,
    AppConfigModule,
    TagsModule,
    ToolsIntegrationsModule,
    ContactsModule,
    BookingModule,
    TasksModule,
    ContactSegmentsModule,
    ChatModule,
    TemplatesModule,
    ScheduledMessagesModule,
    CampaignsModule,
    BroadcastModule,
    WhatsappModule,
    ShortenUrlGeneratorModule,
    ContactUsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailService,
    SendGridService,
    UtilsWhatsAppService,
    S3Storage,
    { provide: APP_FILTER, useClass: ForbiddenExceptionFilter },
    { provide: APP_FILTER, useClass: InternalServerExceptionFilter },
    { provide: APP_FILTER, useClass: UnauthorizeExceptionFilter },
    { provide: APP_FILTER, useClass: BadRequestExceptionFilter },
    { provide: APP_FILTER, useClass: AnyExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
