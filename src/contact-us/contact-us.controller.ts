import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactUs } from './interfaces/contact-us.interface';

@ApiTags('contact-us')
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @ApiOperation({ summary: 'Create contact us entry' })
  @ApiResponse({
    status: 201,
    description: 'The contact us entry has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  async create(
    @Body() createContactUsDto: CreateContactUsDto,
  ): Promise<ContactUs> {
    return this.contactUsService.create(createContactUsDto);
  }

  @ApiOperation({ summary: 'Get all contact us entries' })
  @ApiResponse({ status: 200, description: 'Return all contact us entries.' })
  @Get()
  async findAll(): Promise<ContactUs[]> {
    return this.contactUsService.findAll();
  }

  @ApiOperation({ summary: 'Get contact us entry by id' })
  @ApiResponse({ status: 200, description: 'Return contact us entry by id.' })
  @ApiResponse({ status: 404, description: 'Contact us entry not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ContactUs> {
    return this.contactUsService.findOne(id);
  }

  //   @ApiOperation({ summary: 'Update contact us entry by id' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'The contact us entry has been successfully updated.',
  //   })
  //   @ApiResponse({ status: 404, description: 'Contact us entry not found.' })
  //   @Patch(':id')
  //   async update(
  //     @Param('id') id: string,
  //     @Body() updateContactUsDto: UpdateContactUsDto,
  //   ): Promise<ContactUs> {
  //     return this.contactUsService.update(id, updateContactUsDto);
  //   }

  @ApiOperation({ summary: 'Delete contact us entry by id' })
  @ApiResponse({
    status: 200,
    description: 'The contact us entry has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Contact us entry not found.' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ContactUs> {
    return this.contactUsService.remove(id);
  }
}
