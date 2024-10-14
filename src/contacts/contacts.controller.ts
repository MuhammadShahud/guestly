import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthDecorator } from 'src/common/decorators/auth-decorater';
import { USER_ROLE } from 'src/auth/enums/enums';
import { GetUser } from 'src/common/decorators/user.decorater';
import { IUser } from 'src/user/interfaces/user.interface';
import { pagination } from 'src/common/interface/pagination';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
import {
  CreateContactCommentDto,
  UpdateContactCommentDto,
} from './dto/create-contact-comment.dto';

@ApiTags('Contats')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) { }

  @SwaggerDecorator('create contact', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Post()
  async create(
    @Body() createContactDto: CreateContactDto,
    @GetUser() user: IUser,
  ) {
    return this.contactsService.create(createContactDto, user);
  }

  @SwaggerDecorator('bulk add tag', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Post('bulk-tagging')
  async bulkTag(
    @Body('contactIds') contactIds: string[],
    @Body('tagIds') tagIds: string[],
  ) {
    return this.contactsService.bulkTag(contactIds, tagIds);
  }

  @SwaggerDecorator('get all contact', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Get()
  @ApiQuery({
    name: 'tags',
    required: false,
  })
  @ApiQuery({
    name: 'language',
    required: false,
  })
  @ApiQuery({
    name: 'source',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({ name: 'lastConversationFrom', required: false })
  @ApiQuery({ name: 'lastConversationTo', required: false })
  @ApiQuery({ name: 'marketingOptIn', required: false, enum: ['SUBSCRIBED', 'NON-SUBSCRIBED', 'UNSUBSCRIBED'] })
  @ApiQuery({ name: 'sortField', required: false, enum: ['name', 'surName', 'createdAt', 'email'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @GetUser() user: IUser,
    @Query() query: pagination,
    @Query('tags') tags: string,
    @Query('language') language: string,
    @Query('source') source: string,
    @Query('search') search: string,
    @Query('lastConversationFrom') lastConversationFrom: string,
    @Query('lastConversationTo') lastConversationTo: string,
    @Query('marketingOptIn') marketingOptIn: string,
    @Query('sortField') sortField: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'asc'
    ) {
    return await this.contactsService.findAll(
      user,
      query,
      tags,
      language,
      source,
      search,
      lastConversationFrom,
      lastConversationTo,
      marketingOptIn,
      sortField,
      sortOrder
      );
  }
  @SwaggerDecorator('get comments', true)
  @Get('comments/:contactId')
  fetchComments(@Param('contactId') id: string) {
    return this.contactsService.fetchComments(id);
  }

  @SwaggerDecorator('get single contact', true)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @SwaggerDecorator('update contact', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch()
  update(@Body() updateContactDto: UpdateContactDto, @GetUser() user: IUser) {
    return this.contactsService.update(updateContactDto, user);
  }
  @SwaggerDecorator('delete a contact comment', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Delete('delete-comment')
  deleteComment(
    @Query('contactId') contactId: string,
    @Query('commentId') commentId: string,
    @GetUser() user: IUser,
  ) {
    return this.contactsService.deleteComment(contactId, commentId);
  }
  @SwaggerDecorator('delete contact', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Delete(':contactId')
  remove(@Param('contactId') contactId: string, @GetUser() user: IUser) {
    return this.contactsService.remove(contactId, user);
  }

  @SwaggerDecorator('create a contact comment', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch('comment')
  createComment(
    @Body() createCommentDto: CreateContactCommentDto,
    @GetUser() user: IUser,
  ) {
    return this.contactsService.createComment(createCommentDto, user);
  }

  @SwaggerDecorator('update a contact comment', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch('update-comment')
  updateComment(
    @Body() updateCommentDto: UpdateContactCommentDto,
    @GetUser() user: IUser,
  ) {
    return this.contactsService.updateComment(updateCommentDto, user);
  }
}
