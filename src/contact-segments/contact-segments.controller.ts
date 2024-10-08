import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ContactSegmentsService } from './contact-segments.service';
import {
  ConditionGroupDto,
  CreateContactSegmentDto,
} from './dto/create-contact-segment.dto';
import { UpdateContactSegmentDto } from './dto/update-contact-segment.dto';
import { AuthDecorator } from 'src/common/decorators/auth-decorater';
import { USER_ROLE } from 'src/auth/enums/enums';
import { GetUser } from 'src/common/decorators/user.decorater';
import { IUser } from 'src/user/interfaces/user.interface';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
import { pagination } from 'src/common/interface/pagination';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Contact Segments')
@Controller('contact-segments')
export class ContactSegmentsController {
  constructor(
    private readonly contactSegmentsService: ContactSegmentsService,
  ) {}
  @SwaggerDecorator('create contact segment', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Post()
  create(
    @Body() createContactSegmentDto: CreateContactSegmentDto,
    @GetUser() user: IUser,
  ) {
    return this.contactSegmentsService.create(createContactSegmentDto, user);
  }
  @SwaggerDecorator('get all contact segments', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @Get()
  findAll(
    @Query() query: pagination,
    @Query('search') search: string,
    @GetUser() user: IUser,
  ) {
    return this.contactSegmentsService.findAll(query, search, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactSegmentsService.findOne(id);
  }
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch()
  update(@Body() updateContactSegmentDto: UpdateContactSegmentDto) {
    return this.contactSegmentsService.update(updateContactSegmentDto);
  }

  @Get('get-contacts-by-Id/:segmentId')
  @UseGuards(AuthGuard())
  async getContactsBySegementId(
    @Param('segmentId') segmentId: string,
    @GetUser() user: IUser,
  ) {
    return await this.contactSegmentsService.getContactsBySegementId(
      segmentId,
      user?.currentBuisness?.id,
    );
  }

  @Post('get-filtered-records')
  @ApiBody({ type: CreateContactSegmentDto })
  @UseGuards(AuthGuard())
  async getContactsForSegements(
    @Body() filters: Partial<CreateContactSegmentDto>,
    @GetUser() user: IUser,
  ) {
    console.log(user, 'user');
    // console.log('it was in the controller');
    return await this.contactSegmentsService.getContactsForSegements(
      filters,
      user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactSegmentsService.remove(id);
  }
}
