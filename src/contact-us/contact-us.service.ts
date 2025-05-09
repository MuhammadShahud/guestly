import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { ContactUs } from './interfaces/contact-us.interface';
import { SendGridService } from 'src/utils/utils.sendGridService';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectModel('ContactUs') private readonly contactUsModel: Model<ContactUs>,
    private readonly sendGridServce: SendGridService,
    private readonly configServce: ConfigService,
  ) {}

  async create(createContactUsDto: CreateContactUsDto): Promise<ContactUs> {
    const createdContactUs = new this.contactUsModel(createContactUsDto);
    const savedContact = await createdContactUs.save();
    await this.sendGridServce.sendContctUsMail(
      {
        to: this.configServce.get('CONTACT_TO_EMAIL'),
        subject: 'New Contact Us Submission',
      },
      savedContact,
    );
    return savedContact;
  }

  async findAll(): Promise<ContactUs[]> {
    return this.contactUsModel.find().exec();
  }

  async findOne(id: string): Promise<ContactUs> {
    const contactUs = await this.contactUsModel.findById(id).exec();
    if (!contactUs) {
      throw new NotFoundException(`ContactUs with ID "${id}" not found`);
    }
    return contactUs;
  }

  async update(
    id: string,
    updateContactUsDto: UpdateContactUsDto,
  ): Promise<ContactUs> {
    const updatedContactUs = await this.contactUsModel
      .findByIdAndUpdate(id, updateContactUsDto, { new: true })
      .exec();
    if (!updatedContactUs) {
      throw new NotFoundException(`ContactUs with ID "${id}" not found`);
    }
    return updatedContactUs;
  }

  async remove(id: string): Promise<ContactUs> {
    const deletedContactUs = await this.contactUsModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedContactUs) {
      throw new NotFoundException(`ContactUs with ID "${id}" not found`);
    }
    return deletedContactUs;
  }
}
