import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
interface Mail {
  to: string;
  templateId: string;
  subject?: string;
}

@Injectable()
export class SendGridService {
  private from: string;
  private sendGrifApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.sendGrifApiKey = this.configService.get<string>('SENDGRID_PASSWORD');
    this.from = `Guestly <${this.configService.get<string>('EMAIL_FROM')}>`;
    sgMail.setApiKey(this.sendGrifApiKey);
  }

  async send(mail: Mail, payload?: object): Promise<[Error | null, boolean]> {
    try {
      const sendObj = {
        to: mail.to,
        from: this.from,
        subject: mail.subject || 'Default Subject',
        templateId: mail.templateId,
        dynamic_template_data: payload,
      };

      console.log(
        'Send object before sending email:',
        JSON.stringify(sendObj, null, 2),
      );
      await sgMail.send(sendObj);
      console.log('Email sent successfully');
      return [null, true];
    } catch (error) {
      console.error(
        'Error sending email:',
        error.response ? error.response.body : error,
      );
      return [error, false];
    }
  }
}
