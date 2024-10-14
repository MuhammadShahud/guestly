import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AppService {
  getHello(request: Request): any {
    return {
      message: 'WELCOME TO GUESTLY APIS!',
      headers: request.headers['cloudfront-viewer-country']
    };
  }
}
