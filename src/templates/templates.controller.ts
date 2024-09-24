import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
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
  @ApiOperation({ summary: 'Get all templates' })
  @ApiResponse({
    status: 200,
    description: 'List of templates',
    type: Promise<ITemplate[]>,
  })
  findAll() {
    return this.templateService.findAll();
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
