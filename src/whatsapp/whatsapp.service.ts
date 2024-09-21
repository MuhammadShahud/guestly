import { Injectable } from '@nestjs/common';
import { CreateWhatsappDto } from './dto/create-whatsapp.dto';
import { UpdateWhatsappDto } from './dto/update-whatsapp.dto';
import { UtilsWhatsAppService } from 'src/utils/utils.whatsapp';
import { ContactsService } from 'src/contacts/contacts.service';
import { ToolsIntegrationsService } from 'src/tools-integrations/tools-integrations.service';
import { Request } from 'express';
import { S3Storage } from 'src/utils/utils.s3';
import axios from 'axios';
import { ApiService } from 'src/utils/apiServise';
import { ChatService } from 'src/chat/chat.service';
import { BuisnessService } from 'src/buisness/buisness.service';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly metaService: UtilsWhatsAppService,
    private readonly contactService: ContactsService,
    private readonly toolsAndIntegration: ToolsIntegrationsService,
    private readonly s3Service: S3Storage,
    private readonly apiService: ApiService,
    private readonly chatService: ChatService,
    private readonly buisnessService: BuisnessService,
    private readonly organizationervice: OrganizationService,
  ) {}

  async testWhatsAppWebHook(mode: string, token: string, challenge: string) {
    if (
      mode &&
      token ===
        'V3ryC0mpl3xJWT$ecret!W1thL0tsOfR@nd0mCharsAndNumb3rsAndSp3ci@lChar$^&*#@!'
    ) {
      return challenge;
    } else {
      return 'Verification token mismatch';
    }
  }

  async handleWhatsAppWebHook(request: Request) {
    const body = request.body;
    if (['whatsapp_business_account'].includes(body.object)) {
      const changes = body.entry[0].changes;

      for (let i = 0; i < changes.length; i++) {
        const element = changes[i];

        // Condition when the owner sends a message
        if (element.field === 'messages') {
          // Check if the owner receives a message
          if ('contacts' in element.value) {
            const { contacts, messages, metadata } = element.value;
            const phoneNumber = metadata.display_phone_number;

            // Retrieve business details
            const business = await this.toolsAndIntegration.getTandIFn({
              'whatsapp.phoneNumber': phoneNumber,
            });

            if (!business) return;

            const contactPhoneNo = messages[0].from;

            // Retrieve or create contact
            let contact = await this.contactService.getContactFn({
              phoneNo: contactPhoneNo,
            });

            if (!contact) {
              const contactName = contacts[0].profile?.name || contactPhoneNo;
              contact = await this.contactService.createContactFn({
                name: contactName,
                source: 'WA',
                profile: 'incomplete',
                phoneNo: contactPhoneNo,
                business: business.buisness,
              });
            }


            // Retrieve business information
            const _business = await this.organizationervice.organizationHelperFn({
              buisness: {$in : [business.buisness]},
            });

            // Initialize chat room
            const room = await this.chatService.initializeChat(
              _business.owner._id,
              contact,
            );

            // Loop through each message and handle the type
            for (let index = 0; index < messages.length; index++) {
              const message = messages[index];
              let isForwarded = false;

              // Check if the message is a forwarded text
              if (message.type === 'text') {
                if (message.context?.forwarded) {
                  isForwarded = true;
                }
                await this.chatService.createChat(
                  room.data._id,
                  'text',
                  message.text.body,
                  isForwarded,
                  _business.owner._id,
                  contact._id,
                );
              }

              // Check if the message is an audio message
              if (message.type === 'audio') {
                await this.downloadWhatsAppMedia(
                  message.audio.id,
                  'YOUR_ACCESS_TOKEN',
                );
              }

              // Check if the message is an image
              if (message.type === 'image') {
                await this.downloadWhatsAppMedia(
                  message.image.id,
                  'YOUR_ACCESS_TOKEN',
                );
              }

              // Check if the message is a video
              if (message.type === 'video') {
                await this.downloadWhatsAppMedia(
                  message.video.id,
                  'YOUR_ACCESS_TOKEN',
                );
              }
            }
          }

          return { message: 'Webhook worked successfully' };
        }
      }
    }
  }

  async downloadWhatsAppMedia(mediaId: string, accessToken: string) {
    const [mediaUrlerror, mediaUrlRes] = await this.apiService.getApiFn(
      `https://graph.facebook.com/v20.0/${mediaId}`,
      {
        Authorization: `Bearer ${accessToken}`,
      },
    );

    if (mediaUrlerror) return [mediaUrlerror, null];

    const [imageBufferError, imageBuffer] =
      await this.apiService.getApiFn<ArrayBuffer>(
        mediaUrlRes['url'],
        {
          Authorization: `Bearer ${accessToken}`,
        },
        'arraybuffer',
      );

    if (imageBufferError) return [imageBufferError, null];

    const fileData = Object.create(null);
    fileData.attachments = [
      {
        fieldname: 'attachments',
        originalname: mediaUrlRes['messaging_product'],
        encoding: '7bit',
        mimetype: mediaUrlRes['mime_type'],
        buffer: imageBuffer,
        size: imageBuffer.byteLength,
      },
    ];

    const uploadFiles = await this.s3Service.uploadFiles(fileData);

    const keys = uploadFiles;
  }
}
