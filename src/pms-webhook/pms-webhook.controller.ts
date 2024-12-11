import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WebhookPayloadDto } from './dto/booking-webhook.dto';
import { PmsWebhookService } from './pms-webhook.service';
import { WebhookAuthGuard } from './booking-webhook.guard';
import { ApiTags } from '@nestjs/swagger';
import { Business } from './business.decorator';

@ApiTags('PMS')
@Controller('/rest/external-api')
export class PmsWebhookController {
  constructor(private readonly bookingWebhookService: PmsWebhookService) {}

  @Post('/bookings/import')
  @UseGuards(WebhookAuthGuard)
  async handleBookingWebhook(
    @Body() payload: WebhookPayloadDto,
    @Business() business: any,
  ) {
    const results = await Promise.all(
      payload.reservations.map((reservation) =>
        this.bookingWebhookService.processReservation(
          reservation,
          business._id,
        ),
      ),
    );

    return {
      message: 'Bookings processed successfully',
      results,
    };
  }
}
