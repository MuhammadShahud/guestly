import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { ContactSegmentsService } from 'src/contact-segments/contact-segments.service';
import { CampaignService } from './campaigns.service';
import { ContactsService } from 'src/contacts/contacts.service';

@Processor('campaign')
export class CampaignProcessor {
  private readonly logger = new Logger(CampaignProcessor.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly campaignService: CampaignService,
    private readonly contactService: ContactsService,
    private readonly ContactSegmentService: ContactSegmentsService,
    @InjectQueue('campaign') private readonly campaignQueue: Queue,
  ) {}

  @Process('register')
  async handleRegisterCampaign(
    job: Job<{
      segment: string;
      business: string;
      campaign: string;
    }>,
  ) {
    const { segment, business, campaign } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${segment}`);

    const findContacts =
      await this.ContactSegmentService.getContactsBySegementId(
        segment,
        business,
      );
    console.log(findContacts, 'findContacts');
    const contacts = findContacts[0].contacts;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      await this.campaignQueue.add(
        'schedule',
        {
          contactId: contact,
          campaignId: campaign,
          business,
        },
        {
          attempts: 3,
          delay: 2000,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    try {
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }

  @Process('schedule')
  async handleScheduleCampaign(
    job: Job<{
      contactId: string;
      campaignId: string;
      business: string;
    }>,
  ) {
    const { contactId, campaignId, business } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${contactId}`);

    const campaign = await this.campaignService.findOne(campaignId);
    const contact = (await this.contactService.findOne(contactId)).data;

    const template = campaign.templates.find(
      (t) => t.language == contact.language,
    );

    const default_template = campaign.templates.find(
      (t) => t.is_default == true,
    );

    console.log(template, default_template);

    const targetDate = new Date(
      `${campaign.scheduling.date}T${campaign.scheduling.time}`,
    ); // Example target date and time (ISO format)
    const currentDate = new Date();

    // Calculate delay in milliseconds
    const delay = targetDate.getTime() - currentDate.getTime();

    await this.campaignQueue.add(
      'send',
      {
        contact: contact._id,
        template: template ? template : default_template,
        business: business,
        campaign: campaignId,
      },
      {
        attempts: 3,
        delay: delay,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    try {
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }

  @Process('send')
  async handleSendCampaign(
    job: Job<{
      template: any;
      contact: string;
      business: string;
      campaign: string;
    }>,
  ) {
    const { template, contact, business, campaign } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${contact}`);

    try {
      await this.whatsappService.sendTemplateMessage(
        contact,
        template,
        business,
      );
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }
}
