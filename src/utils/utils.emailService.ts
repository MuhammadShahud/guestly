import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { renderFile } from 'ejs';
import { htmlToText } from 'html-to-text';
import { join } from 'path';
interface EmailUser {
  email: string;
  firstName?: string;
  name?: string;
  userName?: string;
}
@Injectable()
export class EmailService {
  private from: string;
  private baseUrl: string;
  constructor(private readonly configService: ConfigService) {
    this.from = `Guestly <${this.configService.get('EMAIL_FROM')}>`;
    this.baseUrl = this.configService.get('API_HOSTED_URL');
  }
  newTransport() {
    // Sendgrid
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 465,
      auth: {
        user: this.configService.get('SENDGRID_USERNAME'),
        pass: this.configService.get('SENDGRID_PASSWORD'),
      },
    });
  }
  // Send the actual email
  async send(
    user: EmailUser,
    template: string,
    subject?: string,
    url?: string,
    payload?,
  ) {
    const { email, name, firstName } = user;
    // this.firstName = user.name.split(' ')[0];
    // 1) Render HTML based on a pug template
    const _path: string = join(
      __dirname,
      '..',
      '..',
      'views',
      'email',
      `${template}.ejs`,
    );
    console.log({ _path });
    const html = await renderFile(_path, {
      firstName: name || firstName,
      url: url,
      to: email,
      subject,
      payload,
      baseUrl: this.baseUrl,
    });
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: email,
      subject,
      html: html,
      text: htmlToText(html),
    };
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
    console.log('Email Sent Successfully');
  }

  // this will be set according to buisness needs
  async sendWelcome(user: EmailUser, payload) {
    const url = this.configService.get('API_HOSTED_URL');
    await this.send(user, 'welcome', payload.subject, url, payload);
  }
  async resendOtp(user: EmailUser, payload) {
    const url = this.configService.get('API_HOSTED_URL');
    await this.send(user, 'resendOtp', payload.subject, '', payload);
  }
  async forgotPassword(user: EmailUser, payload) {
    const url = this.configService.get('API_HOSTED_URL');
    await this.send(user, 'forgotPassword', payload.subject, '', payload);
  }

  async confirmSignup(user: EmailUser, payload) {
    await this.send(user, 'confirmation', payload.subject, '', payload);
  }
}
