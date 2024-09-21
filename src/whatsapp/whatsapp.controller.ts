import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Request } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
  ) {}
  @Get('webhook-test')
  async testHello(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.whatsappService.testWhatsAppWebHook(mode, token, challenge);
  }
  @Post('webhook-test')
  async handleWebhook(@Req() request: Request) {
    await this.whatsappService.handleWhatsAppWebHook(request);
    return { message: 'webhook worked' };
  }
}
