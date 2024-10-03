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
import {
  TemplateButtonTypeEnum,
  TemplateContentTypeEnum,
  TemplateStatusEnum,
} from 'src/templates/enums/template.enum';
import { ITemplate } from 'src/templates/interfaces/template.interface';
import { ConfigService } from '@nestjs/config';
import { IBroadcast } from 'src/broadcast/interfaces/broadcast.enum';

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
    private readonly configService: ConfigService,
  ) {}

  private createTemplateURL = (wab_id: string) =>
    `${this.configService.get('FACEBOOK_URL')}/${wab_id}/message_templates`;

  private updateTemplateURL = (template_id: string) =>
    `${this.configService.get('FACEBOOK_URL')}/${template_id}`;

  private createMessageURL = (phone_id: string) =>
    `${this.configService.get('FACEBOOK_URL')}/${phone_id}`;

  private createTemplate = async (t: ITemplate) => {
    return {
      name: t.name,
      language: t.language,
      category: t.category,
      components: [
        ...(t.header && t.header.content_type == TemplateContentTypeEnum.TEXT
          ? [
              {
                type: 'HEADER',
                format: 'TEXT',
                text: t.header.content_value,
                example: {
                  header_text: ['Summer Sale'],
                },
              },
            ]
          : []),
        ...(t.header && t.header.content_type == TemplateContentTypeEnum.MEDIA
          ? [
              {
                type: 'HEADER',
                format: 'IMAGE',
                example: { header_handle: [t.header.content_value] },
              },
            ]
          : []),
        ...(t.header &&
        t.header.content_type == TemplateContentTypeEnum.LOCATION
          ? [{ type: 'HEADER', format: 'LOCATION' }]
          : []),
        {
          type: 'BODY',
          text: t.raw_html_body,
          example: {
            body_text: [t.body_variables.map((v) => v.default_value)],
          },
        },
        { type: 'FOOTER', text: t.footer },
        {
          type: 'BUTTONS',
          buttons: t.buttons.map((b) => ({
            type: b.type === TemplateButtonTypeEnum.URL ? 'URL' : b.type,
            text: b.text,
            ...(b.type === TemplateButtonTypeEnum.URL && {
              url: b.value,
              example: ['summer2023'],
            }),
            ...(b.type === TemplateButtonTypeEnum.PHONE_NUMBER && {
              phone_number: b.value,
            }),
          })),
        },
      ],
    };
  };

  private createTemplateMessage = async (
    t: ITemplate,
    to_phone: number,
    body_parameters: Object[],
  ) => {
    return {
      messaging_product: 'whatsapp',
      to: to_phone,
      type: 'template',
      template: {
        name: t.name,
        language: {
          code: t.language,
        },
        components: [{ type: 'body', parameters: body_parameters }],
      },
    };
  };

  async testWhatsAppWebHook(mode: string, token: string, challenge: string) {
    if (mode && token === 'testVerifictionToken') {
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
            const _business =
              await this.organizationervice.organizationHelperFn({
                buisness: { $in: [business.buisness] },
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

  async createWhatsappTemplate(t: ITemplate) {
    const template = await this.createTemplate(t);

    console.log(JSON.stringify(template));

    const business = await this.toolsAndIntegration.getTandIFn({
      buisness: t.business,
    });

    if (!business.whatsapp) {
      throw new Error(
        "Can't find whatsapp of your business, You must connect whatsapp business account before creating template",
      );
    }

    const [err, res] = await this.apiService.postApi(
      this.createTemplateURL(business.whatsapp.whatappAccountId),
      template,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
      },
    );

    if (err && err['response']) {
      throw new Error(
        `${err['response']['data']['error']['error_user_title']}, ${err['response']['data']['error']['error_user_msg']}`,
      );
    }
    return res;
  }

  async updateWhatsappTemplate(t: ITemplate) {
    const template = await this.createTemplate(t);

    const business = await this.toolsAndIntegration.getTandIFn({
      buisness: t.business,
    });

    if (!business.whatsapp) {
      throw new Error(
        "Can't find whatsapp of your business, You must connect whatsapp business account before creating template",
      );
    }

    const [err, res] = await this.apiService.postApi(
      this.updateTemplateURL(t.whatsAppTemplateId),
      template,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
      },
    );

    if (err && err['response']) {
      throw new Error(
        `${err['response']['data']['error']['error_user_title']}, ${err['response']['data']['error']['error_user_msg']}`,
      );
    }
    return res;
  }

  async getTempleteById(t: string) {
    const [err, res] = await this.apiService.getApi(this.updateTemplateURL(t), {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
    });
    return res;
  }

  async sendBroadCastMessages(B: IBroadcast, template: ITemplate) {
    if (B.body_variables.length != template.body_variables.length) {
      throw new Error('Please provide all body variables for the template.');
    }

    if (!template.whatsAppTemplateId) {
      throw new Error('Template is not registerd on whatsapp.');
    }

    if (template.status != TemplateStatusEnum.APPROVED) {
      throw new Error('Template is not approved to send messages.');
    }

    const business = await this.toolsAndIntegration.getTandIFn({
      buisness: B.business,
    });

    if (!business.whatsapp) {
      throw new Error(
        "Can't find whatsapp of your business, You must connect whatsapp business account before creating template",
      );
    }

    const body_parameters = B.body_variables.map((v) => {
      return { type: 'text', text: v.value };
    });
    const message = await this.createTemplateMessage(
      template,
      Number(business.whatsapp.phoneNumberId),
      body_parameters,
    );

    console.log(JSON.stringify(message));

    const sendMessageToContact = async (contactId: string) => {
      const contact = await this.contactService.getContactFn(contactId);

      const [err, res] = await this.apiService.postApi(
        this.createMessageURL(contact.phoneNo),
        message,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
        },
      );

      if (err) {
        console.error(`Error sending message to ${contact}:`, err);
        return { success: false, contact };
      }

      console.log(`Message sent successfully to ${contact}`);
      return { success: true, contact };
    };

    const results = await Promise.all(
      B.contacts.map((contact) => sendMessageToContact(contact)),
    );

    const failedMessages = results.filter((result) => !result.success);
    console.log('Failed Messages:', failedMessages);

    return results;
  }
}
