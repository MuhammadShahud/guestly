import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ICampaign } from './interfaces/campaign.interface';
import { CampaignService } from './campaigns.service';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignStatus } from './enums/campaign.emun';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
  ): Promise<ICampaign> {
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all campaigns with optional filters and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns with pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    example: CampaignStatus.DRAFT,
    enum: Object.keys(CampaignStatus),
  })
  @ApiQuery({
    name: 'template',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'contact_segment',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'business',
    required: false,
    type: String,
  })
  //   @ApiQuery({
  //     name: 'createdAtFrom',
  //     required: false,
  //     type: String,
  //     example: '2023-01-01',
  //   })
  //   @ApiQuery({
  //     name: 'createdAtTo',
  //     required: false,
  //     type: String,
  //     example: '2023-12-31',
  //   })
  //   @ApiQuery({
  //     name: 'updatedAtFrom',
  //     required: false,
  //     type: String,
  //     example: '2023-01-01',
  //   })
  //   @ApiQuery({
  //     name: 'updatedAtTo',
  //     required: false,
  //     type: String,
  //     example: '2023-12-31',
  //   })
  //   @ApiQuery({
  //     name: 'schedulingDateFrom',
  //     required: false,
  //     type: String,
  //     example: '2024-01-01',
  //   })
  //   @ApiQuery({
  //     name: 'schedulingDateTo',
  //     required: false,
  //     type: String,
  //     example: '2024-12-31',
  //   })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: any,
  ): Promise<{
    data: ICampaign[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.campaignService.findAll(filters, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findOne(@Param('id') id: string): Promise<ICampaign> {
    return this.campaignService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiBody({ type: UpdateCampaignDto })
  @ApiParam({ name: 'id', description: 'ID of the campaign to update' })
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ): Promise<ICampaign> {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async delete(@Param('id') id: string): Promise<ICampaign> {
    return this.campaignService.delete(id);
  }
}
