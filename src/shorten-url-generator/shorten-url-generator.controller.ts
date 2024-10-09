import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Redirect,
  Res,
} from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { ShortenUrlGeneratorService } from './shorten-url-generator.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IUrl } from './interfaces/shorten-url-generator.interface';

@ApiTags('Url Shortner')
@Controller('url')
export class ShortenUrlGeneratorController {
  constructor(private readonly urlService: ShortenUrlGeneratorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a short URL' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({
    status: 201,
    description: 'The short URL has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(@Body() createUrlDto: CreateUrlDto): Promise<IUrl> {
    console.log(createUrlDto, 'createUrlDto');
    return this.urlService.create(createUrlDto);
  }

  @Get(':shortenUrl')
  @ApiOperation({ summary: 'Retrieve the original URL' })
  @ApiParam({
    name: 'shortenUrl',
    description: 'The short URL identifier',
    example: 'abcd1234',
  })
  @ApiResponse({
    status: 200,
    description: 'The original URL has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  async findOne(
    @Param('shortenUrl') shortenUrl: string,
    @Res() res,
  ): Promise<void> {
    const url = await this.urlService.findOne(shortenUrl);
    console.log(url, 'url');
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return res.redirect(url.original_url);
  }
}
