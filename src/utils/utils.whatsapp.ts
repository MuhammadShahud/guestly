import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as meta from 'facebook-nodejs-business-sdk';

@Injectable()
export class UtilsWhatsAppService {
  private readonly businessId: string;
  private api: any;
  private business: any;

  constructor(private readonly configService: ConfigService) {
    this.businessId = this.configService.get<string>(
      'GUESTLY_FACEBOOK_BUSINESS_ID',
    );
  }

  async initializeWhatsapp(token: string) {
    this.api = meta.FacebookAdsApi.init(token);
    const Business = meta.Business;
    this.business = new Business(this.businessId);
  }

  async getWhatsAppBusinessAccounts(token: string): Promise<any> {
    try {
      await this.initializeWhatsapp(token);
      const whatsappAccounts =
        await this.business.getOwnedWhatsAppBusinessAccounts();
      return [null, whatsappAccounts];
    } catch (error) {
      console.error('Error fetching WhatsApp Business Accounts:', error);
      return [error, null];
    }
  }

  async getMetaAccountPhoneNumber(token: string, accountId: string) {
    try {
      await this.initializeWhatsapp(token);
      const account = new meta.WhatsAppBusinessAccount(accountId);
      const phoneNumbers = await account.getPhoneNumbers();
      return [null, phoneNumbers];
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      return [error, null];
    }
  }
}
