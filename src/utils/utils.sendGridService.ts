import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
interface Mail {
  to?: string;
  templateId?: string;
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

  async sendContctUsMail(
    mail: Mail,
    payload?: any,
  ): Promise<[Error | null, boolean]> {
    try {
      const sendObj = {
        to: mail.to,
        from: this.from,
        subject: mail.subject,
        text: `You have a new contact us submission:
      Company: ${payload?.company}
      First Name: ${payload?.first_name}
      Surname: ${payload?.surname}
      Email: ${payload?.email}
      Phone Number: ${payload?.phone_no}
      Notes: ${payload?.notes}
      Privacy Policy Accepted: ${payload?.pp_accepted}`,
        html: `<p>You have a new contact us submission:</p>
             <p><strong>Company:</strong> ${payload?.company}</p>
             <p><strong>First Name:</strong> ${payload?.first_name}</p>
             <p><strong>Surname:</strong> ${payload?.surname}</p>
             <p><strong>Email:</strong> ${payload?.email}</p>
             <p><strong>Phone Number:</strong> ${payload?.phone_no}</p>
             <p><strong>Notes:</strong> ${payload?.notes}</p>
             <p><strong>Privacy Policy Accepted:</strong> ${payload?.pp_accepted}</p>`,
      };

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
