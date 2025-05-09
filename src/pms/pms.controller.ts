// src/pms/pms.controller.ts

import { Controller, Post, Patch, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PMSService } from './pms.service';
import { CreateCredentialsDto } from './dto/create-credentials.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('PMS')
@Controller('pms')
export class PMSController {
  constructor(private readonly pmsService: PMSService) {}

  @Post('generate-credentials')
  @ApiOperation({ summary: 'Generate credentials for a business' })
  @ApiResponse({ status: 201, description: 'The credentials have been successfully generated.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async generateCredentials(@Body() createCredentialsDto: CreateCredentialsDto) {
    console.log(createCredentialsDto);
    const newPMS = await this.pmsService.generateCredentials(createCredentialsDto.business);
    return { business: newPMS.business, username: newPMS.username, password: newPMS.password, status: newPMS.status };
  }

  @Patch('update-status')
  @ApiOperation({ summary: 'Update the status of a user' })
  @ApiResponse({ status: 200, description: 'The status has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async updateStatus(@Body() updateStatusDto: UpdateStatusDto) {
    const updatedPMS = await this.pmsService.updateStatus(updateStatusDto.business, updateStatusDto.status);
    return { business: updatedPMS.business, status: updatedPMS.status };
  }

  @Get(':business')
  @ApiOperation({ summary: 'Get credentials by business' })
  @ApiParam({ name: 'business', required: true, description: 'The business of the user' })
  @ApiResponse({ status: 200, description: 'The credentials have been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getCredentials(@Param('business') business: string) {
    const pms = await this.pmsService.getCredentials(business);
    return { business: pms.business, username: pms.username, password: pms.password, status: pms.status };
  }
}
