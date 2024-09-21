import { BadRequestException, HttpStatus } from '@nestjs/common';

export class PaymentRequiredException extends BadRequestException {
  constructor(message: string, data?: any) {
    super({
      message: message,
      statusCode: HttpStatus.PAYMENT_REQUIRED,
      data,
    });
  }
}
