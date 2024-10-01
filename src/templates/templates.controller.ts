import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateService } from './templates.service';
import { ITemplate } from './interfaces/template.interface';

@ApiTags('templates')
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: Promise<ITemplate>,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateTemplateDto })
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templateService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all templates with optional filters and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of templates with pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    example: 'Welcome Template',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    example: 'Marketing',
  })
  @ApiQuery({ name: 'language', required: false, type: String, example: 'en' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    example: 'PENDING',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: any,
  ): Promise<{
    data: ITemplate[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.templateService.findAll(filters, page, limit);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a template by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Template ID' })
  @ApiResponse({
    status: 200,
    description: 'Template found',
    type: Promise<ITemplate>,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a template by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Template ID' })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
    type: Promise<ITemplate>,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiBody({ type: UpdateTemplateDto })
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templateService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Template ID' })
  @ApiResponse({
    status: 200,
    description: 'Template deleted successfully',
    type: Promise<ITemplate>,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  remove(@Param('id') id: string) {
    return this.templateService.remove(id);
  }
}
