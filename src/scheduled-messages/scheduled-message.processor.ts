import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Processor('scheduled-messages')
export class ScheduledMessagesProcessor {
  private readonly logger = new Logger(ScheduledMessagesProcessor.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Process('send')
  async handleSendScheduledMessages(
    job: Job<{
      template: any;
      contact: string;
      business: string;
    }>,
  ) {
    const { template, contact, business } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${contact}`);

    try {
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }
}
