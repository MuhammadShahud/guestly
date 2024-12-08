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
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { AuthDecorator } from 'src/common/decorators/auth-decorater';
import { USER_ROLE } from 'src/auth/enums/enums';
import { GetUser } from 'src/common/decorators/user.decorater';
import { IUser } from 'src/user/interfaces/user.interface';
import { pagination } from 'src/common/interface/pagination';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
import { ApiTags } from '@nestjs/swagger';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
@ApiTags('bookings')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @SwaggerDecorator('create booking', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: IUser) {
    return this.bookingService.create(createBookingDto, user);
  }

  @SwaggerDecorator('get booking', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Get()
  findAll(
    @GetUser() user: IUser,
    @Query() query: pagination,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('treatment') treatment: string,
    @Query('status') status: string,
    @Query('children') children: string,
    @Query('search') search: string,
    @Query('filter') filter: string,
  ) {
    return this.bookingService.findAll(
      user,
      query,
      from,
      to,
      treatment,
      children,
      search,
      filter,
      status,
    );
  }
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch()
  update(@Body() updateBookingDto: UpdateBookingDto, @GetUser() user: IUser) {
    return this.bookingService.update(updateBookingDto, user);
  }
  @SwaggerDecorator('get comments', true)
  @Get('comments/:bookingId')
  fetchComments(@Param('bookingId') id: string) {
    return this.bookingService.fetchComments(id);
  }
  @SwaggerDecorator('create comment', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch('comment')
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: IUser,
  ) {
    return this.bookingService.createComment(createCommentDto, user);
  }

  @SwaggerDecorator('update comment', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch('update-comment')
  updateComment(
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: IUser,
  ) {
    return this.bookingService.updateComment(updateCommentDto, user);
  }

  @SwaggerDecorator('delete comment', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Delete('delete-comment')
  deleteComment(
    @Query('bookingId') bookingId: string,
    @Query('commentId') commentId: string,
    @GetUser() user: IUser,
  ) {
    return this.bookingService.deleteComment(bookingId, commentId);
  }

  @Delete(':bookingId')
  remove(@Param('bookingId') bookingId: string, @GetUser() user: IUser) {
    return this.bookingService.remove(bookingId, user);
  }
}
