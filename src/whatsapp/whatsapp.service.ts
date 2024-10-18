import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
import {
  BroadcastTemplate,
  IBroadcast,
} from 'src/broadcast/interfaces/broadcast.interface';
import { BookingService } from 'src/booking/booking.service';
import { IContact } from 'src/contacts/interface/contact.interface';
import { TemplateService } from 'src/templates/templates.service';
import { TMessage } from './interface/message.interface';
import { MessageService } from 'src/chat/message.service';
import { RoomService } from 'src/chat/room.service';
import { MessageType } from 'src/chat/enums/messge.enum';
import { IChat } from 'src/chat/interfaces/chat.interface';

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
    private readonly bookingService: BookingService,
    @Inject(forwardRef(() => TemplateService))
    private readonly templateService: TemplateService,
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
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
              contact._id,
            );

            // Loop through each message and handle the type
            for (let index = 0; index < messages.length; index++) {
              const message = messages[index];

              let newMessage = await this.messageService.create({
                user: contact?._id,
                from: contact?._id,
                room: room._id,
              });

              newMessage['message']['whatsapp_message_id'] = message.id;

              if (message.context?.forwarded) {
                newMessage['message']['isforwarded'] = true;
              }

              if (message?.context?.message_id) {
                const db_msg = await this.messageService.getMessageByFilter({
                  'message.whatsapp_message_id': message?.context?.message_id,
                });

                newMessage['replyTo'] = db_msg._id;
              }

              // Check if the message is a forwarded text
              if (message.type === MessageType.TEXT) {
                newMessage['message']['message'] = message?.text?.body;
                newMessage['message']['type'] = MessageType.TEXT;
              }

              // Check if the message is an audio message
              if (message.type === MessageType.AUDIO) {
                const uploaded = await this.downloadWhatsAppMedia(
                  message.audio.id,
                  this.configService.get('WHATSAPP_API_TOKEN'),
                );

                newMessage['message']['type'] = MessageType.AUDIO;
                newMessage['message']['audioUrl'] = JSON.stringify(uploaded);
                newMessage['message']['whatsapp_audio_id'] = message.audio.id;
              }

              // Check if the message is an image
              if (message.type === 'image') {
                const uploaded = await this.downloadWhatsAppMedia(
                  message.image.id,
                  this.configService.get('WHATSAPP_API_TOKEN'),
                );

                newMessage['message']['type'] = MessageType.IMAGE;
                newMessage['message']['imageUrl'] = JSON.stringify(uploaded);
                newMessage['message']['caption'] = message?.image?.caption;
                newMessage['message']['whatsapp_image_id'] = message.image.id;
              }

              // Check if the message is a video
              if (message.type === 'video') {
                const uploaded = await this.downloadWhatsAppMedia(
                  message.video.id,
                  this.configService.get('WHATSAPP_API_TOKEN'),
                );
                newMessage['message']['type'] = MessageType.VIDEO;
                newMessage['message']['videoUrl'] = JSON.stringify(uploaded);
                newMessage['message']['whatsapp_video_id'] = message.video.id;
              }

              await newMessage.save();
            }
          }

          if ('statuses' in element.value) {
            const { statuses, metadata } = element.value;
            for (let i = 0; i < statuses.length; i++) {
              const msg = statuses[i];

              const db_msg = await this.messageService.getMessageByFilter({
                'message.whatsapp_message_id': msg,
              });
              db_msg.message.whatsapp_message_status = msg.status;
              await db_msg.save();
            }
          }

          return { message: 'Webhook worked successfully' };
        }

        if (element.field == 'message_template_status_update') {
          await this.templateService.updateByFilter(
            {
              whatsAppTemplateId: element.value.message_template_id,
            },
            { status: element.value.status },
          );
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

    const keys = uploadFiles?.attachments?.map((key) => key);

    return keys;
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

  async sendTemplateMessage(
    contact: string,
    template: BroadcastTemplate,
    business: string,
  ) {
    const b = await this.toolsAndIntegration.getTandIFn({
      buisness: business,
    });

    if (!b.whatsapp) {
      throw new Error(
        "Can't find whatsapp of your business, You must connect whatsapp business account before creating template",
      );
    }

    const contact_doc = await this.contactService.getContactFn({
      _id: contact,
    });

    if (!contact_doc) {
      throw new Error('Contact Not found.');
    }

    if (!template) {
      throw new Error('Broadcast template not found.');
    }

    const created_template = await this.templateService.findOne(
      template.template,
    );

    if (!created_template) {
      throw new Error('Template Not found');
    }

    if (!created_template.whatsAppTemplateId) {
      throw new Error('Template is not registerd on whatsapp.');
    }

    if (
      template.body_variables.length != created_template.body_variables.length
    ) {
      throw new Error('Please provide all body variables for the template.');
    }

    if (created_template.status != TemplateStatusEnum.APPROVED) {
      throw new Error('Template is not approved to send messages.');
    }

    const from_contact = await this.contactService.getContactFn({
      buisness: business,
    });

    const toolsNIn = await this.toolsAndIntegration.getTandIFn({
      buisness: business,
    });

    const body_parameters = template.body_variables.map((v) => {
      return { type: 'text', text: v.value };
    });

    const message = await this.createTemplateMessage(
      created_template,
      Number(contact_doc.phoneNo),
      body_parameters,
    );

    const [err, res] = await this.apiService.postApi(
      this.createMessageURL(toolsNIn.whatsapp.phoneNumberId),
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

    return { success: true, contact };
  }

  async sendMessageByType(messageId: string) {
    const message = await this.messageService.getMessageByFilter({
      _id: messageId,
    });

    if (!message) {
      throw new Error('Message not found.');
    }

    const room = await this.roomService.getRoomByFilter({
      _id: message.room,
    });

    if (!room) {
      throw new Error('Room not found.');
    }

    const contact = await this.contactService.getContactFn({
      _id: message.contact,
    });

    if (!contact) {
      throw new Error('Contact not found.');
    }

    const business = await this.buisnessService.getBuisnessById(
      String(room.buisness),
    );

    const toolsNIn = await this.toolsAndIntegration.getTandIFn({
      buisness: String(room.buisness),
    });

    let w_message: TMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: contact.phoneNo,
      type: message.message.type,
    };

    const msg_type = message.message.type;

    if (msg_type == MessageType.TEXT) {
      w_message['text'] = { body: message.message.message, preview_url: false };
    }

    if (msg_type == MessageType.IMAGE) {
      w_message['image'] = {
        link: message.message.imageUrl,
        id: message.message.whatsapp_image_id,
      };
    }

    if (msg_type == MessageType.AUDIO) {
      w_message['audio'] = {
        link: message.message.audioUrl,
        id: message.message.whatsapp_audio_id,
      };
    }

    if (msg_type == MessageType.VIDEO) {
      w_message['video'] = {
        link: message.message.videoUrl,
        id: message.message.whatsapp_video_id,
      };
    }

    if (message.replyTo) {
      w_message['context'] = {
        message_id: message.message.whatsapp_message_id,
      };
    }

    const [err, res] = await this.apiService.postApi(
      this.createMessageURL(toolsNIn.whatsapp.phoneNumberId),
      w_message,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
      },
    );
    if (err) {
      console.error(`Error sending message to ${contact}:`, err);
      return { success: false, contact };
    }

    return { success: true, contact };
  }
}
