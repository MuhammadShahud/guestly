

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuestDto, ReservationDto } from './dto/booking-webhook.dto';

@Injectable()
export class PmsWebhookService {
  private readonly logger = new Logger(PmsWebhookService.name);

  constructor(
    @InjectModel('Booking') private bookingModel: Model<any>,
    @InjectModel('Contacts') private contactModel: Model<any>,
  ) {}

  private mapTreatment(apiTreatment: string): string {
    const treatmentMap: { [key: string]: string } = {
      'BB': 'BED&BREAKFAST',
      'HALF_BOARD': 'HALFBOARD',
      // Add more mappings as needed
    };
    return treatmentMap[apiTreatment] || 'STAYONLY';
  }

  private async upsertContact(contactData: GuestDto, businessId: string) {
    try {
      const contact = await this.contactModel.findOneAndUpdate(
        {
          name: contactData.name,
          surName: contactData.surname,
          birthDate: new Date(contactData.birthdate),
          buisness: businessId,
        },
        {
          ...contactData,
          gender: contactData.gender === 'MALE' || contactData.gender === 'M' ? 'male' : contactData.gender === 'FEMALE' || contactData.gender === 'F' ? 'female' : 'other',
          source: 'PMS',
          buisness: businessId,
        },
        { upsert: true, new: true },
      );
      return contact._id;
    } catch (error) {
      this.logger.error(`Error upserting contact: ${error.message}`);
      throw error;
    }
  }

  async processReservation(reservation: ReservationDto, businessId: string) {
    // Save main guest contact
    const mainGuestId = await this.upsertContact(reservation.booking_owner, businessId);

    // Save additional guests
    const additionalGuestIds = await Promise.all(
      reservation.guests
        .filter(guest => guest.guest_id !== reservation.booking_owner.guest_id)
        .map(guest => this.upsertContact(guest, businessId)),
    );

    // Prepare booking data
    const bookingData = {
      mainGuest: mainGuestId,
      additionalGuests: additionalGuestIds,
      checkIn: new Date(reservation.checkin_date),
      checkOut: new Date(reservation.checkout_date),
      status: reservation.booking_status,
      price: reservation.booking_price,
      treatment: this.mapTreatment(reservation.treatment),
      adults: reservation.adults,
      children: reservation.children,
      roomNo: reservation.room_number,
      roomCategory: reservation.room_category,
      marketingSource: reservation.marketing_source,
      source: 'PMS',
      business: businessId,
    };

    // Update or create booking
    const booking = await this.bookingModel.findOneAndUpdate(
      {
        bussiness: businessId,
        roomNo: reservation.room_number,
        checkIn: new Date(reservation.checkin_date),
      },
      bookingData,
      { upsert: true, new: true },
    );

    return {
      booking_id: reservation.booking_id,
      status: 'success',
      internal_id: booking._id,
    };
  }
}
