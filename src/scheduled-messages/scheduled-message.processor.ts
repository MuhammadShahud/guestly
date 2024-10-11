import { ScheduleMessageAction } from './enum/schedule-message.enum';
import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { ScheduledMessageService } from './scheduled-messages.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { BookingService } from 'src/booking/booking.service';

@Processor('scheduled-messages')
export class ScheduledMessagesProcessor {
  private readonly logger = new Logger(ScheduledMessagesProcessor.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    @InjectQueue('scheduled-messages')
    private readonly scheduledMessagesQueue: Queue,
    private readonly scheduledMessageService: ScheduledMessageService,
    private readonly contactService: ContactsService,
    private readonly bookingService: BookingService,
  ) {}

  @Process('schedule')
  async handleScheduledMessages(
    job: Job<{
      messageID: string;
    }>,
  ) {
    const { messageID } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${messageID}`);

    const msg = await this.scheduledMessageService.findOne(messageID);

    if (msg.scheduling.action == ScheduleMessageAction.BIRTHDATE) {
      const j = await this.scheduledMessagesQueue.add(
        'birthday',
        {
          messageID: messageID,
        },
        {
          attempts: 5,
          delay: 2000,
          removeOnComplete: false,
          removeOnFail: false,
          repeat: { cron: '0 0 * * *' },
        },
      );

      msg.scheduledQueueJobId = String(j.id);
    }

    if (msg.scheduling.action == ScheduleMessageAction.CHECKIN) {
      const j = await this.scheduledMessagesQueue.add(
        'checkin',
        {
          messageID: messageID,
        },
        {
          attempts: 5,
          delay: 2000,
          removeOnComplete: false,
          removeOnFail: false,
          repeat: { cron: '0 0 * * *' },
        },
      );

      msg.scheduledQueueJobId = String(j.id);
    }

    if (msg.scheduling.action == ScheduleMessageAction.CHECKOUT) {
      const j = await this.scheduledMessagesQueue.add(
        'checkout',
        {
          messageID: messageID,
        },
        {
          attempts: 5,
          delay: 2000,
          removeOnComplete: false,
          removeOnFail: false,
          repeat: { cron: '0 0 * * *' },
        },
      );

      msg.scheduledQueueJobId = String(j.id);
    }

    if (msg.scheduling.action == ScheduleMessageAction.DURING_STAY) {
      const day = msg?.scheduling?.day.substring(0, 2).toUpperCase();
      const hour = msg?.scheduling?.time;
      const cron = `0 ${hour} * * ${day}`;

      const j = await this.scheduledMessagesQueue.add(
        'during',
        {
          messageID: messageID,
        },
        {
          attempts: 5,
          delay: 2000,
          removeOnComplete: false,
          removeOnFail: false,
          repeat: { cron: cron },
        },
      );

      msg.scheduledQueueJobId = String(j.id);
    }

    msg.save();
    try {
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }

  @Process('birthday')
  async handleBirthdayMessages(
    job: Job<{
      messageID: string;
    }>,
  ) {
    const { messageID } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${messageID}`);

    const msg = await this.scheduledMessageService.findOne(messageID);

    const contacts = await this.contactService.findByQuery({
      buisness: msg.business,
    });

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      const template = msg.templates.find(
        (t) => t.language == contact.language,
      );

      const default_template = msg.templates.find((t) => t.is_default == true);

      await this.scheduledMessagesQueue.add(
        'send',
        {
          action: 'BIRTHDATE',
          contact: contact._id,
          template: template ? template : default_template,
          business: msg.business,
        },
        {
          attempts: 3,
          delay: 2000,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    try {
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }

  @Process('checkin')
  async handleCheckinMessages(
    job: Job<{
      messageID: string;
    }>,
  ) {
    const { messageID } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${messageID}`);

    const msg = await this.scheduledMessageService.findOne(messageID);

    const bookings = await this.bookingService.findByQuery({
      bussiness: msg.business,
      status: 'CHECKED-IN',
      checkin_messages: { $nin: [msg._id] },
    });

    const default_template = msg.templates.find((t) => t.is_default == true);

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];

      const contact = await this.contactService.getContactFn({
        _id: booking.mainGuest,
      });

      const template = msg.templates.find(
        (t) => t.language == contact.language,
      );

      const checkInDate = new Date(booking.checkIn);

      const days =
        msg.scheduling.day.includes('days before') ||
        msg.scheduling.day.includes('days after')
          ? Number(msg.scheduling.day.split(' ').at(0))
          : 0;

      const targetDate = msg.scheduling.day.includes('days before')
        ? new Date(checkInDate.setDate(checkInDate.getDate() - days))
        : msg.scheduling.day.includes('days after')
          ? new Date(checkInDate.setDate(checkInDate.getDate() + days))
          : checkInDate;

      targetDate.setHours(Number(msg.scheduling.time), 0, 0, 0);

      const currentDate = new Date();

      const delay = targetDate.getTime() - currentDate.getTime();
      await this.scheduledMessagesQueue.add(
        'send',
        {
          action: 'CHECKED-IN',
          bookingId: booking._id,
          contact: booking.mainGuest,
          template: template ? template : default_template,
          business: msg.business,
        },
        {
          attempts: 3,
          delay: delay,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      booking.checkin_messages.push(msg._id);

      booking.save();
    }

    try {
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }

  @Process('checkout')
  async handleCheckOutMessages(
    job: Job<{
      messageID: string;
    }>,
  ) {
    const { messageID } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${messageID}`);

    const msg = await this.scheduledMessageService.findOne(messageID);

    const bookings = await this.bookingService.findByQuery({
      bussiness: msg.business,
      status: 'CHECKED-OUT',
      checkout_messages: { $nin: [msg._id] },
    });

    const default_template = msg.templates.find((t) => t.is_default == true);

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];

      const contact = await this.contactService.getContactFn({
        _id: booking.mainGuest,
      });

      const template = msg.templates.find(
        (t) => t.language == contact.language,
      );

      const checkOutDate = new Date(booking.checkOut);

      const days =
        msg.scheduling.day.includes('days before') ||
        msg.scheduling.day.includes('days after')
          ? Number(msg.scheduling.day.split(' ').at(0))
          : 0;

      const targetDate = msg.scheduling.day.includes('days before')
        ? new Date(checkOutDate.setDate(checkOutDate.getDate() - days))
        : msg.scheduling.day.includes('days after')
          ? new Date(checkOutDate.setDate(checkOutDate.getDate() + days))
          : checkOutDate;

      targetDate.setHours(Number(msg.scheduling.time), 0, 0, 0);

      const currentDate = new Date();

      const delay = targetDate.getTime() - currentDate.getTime();
      await this.scheduledMessagesQueue.add(
        'send',
        {
          action: 'CHECKED-OUT',
          bookingId: booking._id,
          contact: booking.mainGuest,
          template: template ? template : default_template,
          business: msg.business,
        },
        {
          attempts: 3,
          delay: delay,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      booking.checkin_messages.push(msg._id);

      booking.save();
    }

    try {
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }

  @Process('during')
  async handleDuringMessages(
    job: Job<{
      messageID: string;
    }>,
  ) {
    const { messageID } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${messageID}`);

    const msg = await this.scheduledMessageService.findOne(messageID);

    const contacts = await this.contactService.findByQuery({
      buisness: msg.business,
    });

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      const template = msg.templates.find(
        (t) => t.language == contact.language,
      );

      const default_template = msg.templates.find((t) => t.is_default == true);

      await this.scheduledMessagesQueue.add(
        'send',
        {
          action: 'DURING',
          contact: contact._id,
          template: template ? template : default_template,
          business: msg.business,
        },
        {
          attempts: 3,
          delay: 2000,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    try {
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }

  @Process('send')
  async handleSendMessages(
    job: Job<{
      template: any;
      contact: string;
      business: string;
    }>,
  ) {
    const { template, contact, business } = job.data;
    this.logger.log(`Processing job ${job.id} for Contact ID: ${contact}`);

    await this.whatsappService.sendMessage(contact, template, business);
    try {
    } catch (error) {
      throw error; // Rethrow to allow Bull to handle retries
    }
  }
}
