// src/broadcast/broadcast.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { BroadcastService } from './broadcast.service';
import { Logger } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Processor('broadcast')
export class BroadcastProcessor {
  private readonly logger = new Logger(BroadcastProcessor.name);

  constructor(
    private readonly broadcastService: BroadcastService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Process('send')
  async handleSendBroadcast(
    job: Job<{
      template: any;
      contact: string;
      business: string;
    }>,
  ) {
    const { template, contact, business } = job.data;
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
