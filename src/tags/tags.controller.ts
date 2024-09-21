import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/common/guards/role.guard';
import { GetUser, Role } from 'src/common/decorators/user.decorater';
import { IUser } from 'src/user/interfaces/user.interface';
import { pagination } from 'src/common/interface/pagination';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
import { AuthDecorator } from 'src/common/decorators/auth-decorater';
import { USER_ROLE } from 'src/auth/enums/enums';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @SwaggerDecorator('create tags', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Post()
  async create(@Body() createTagDto: CreateTagDto, @GetUser() user: IUser) {
    return await this.tagsService.create(createTagDto, user);
  }

  @SwaggerDecorator('get all tags', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Get()
  async findAll(@GetUser() user: IUser, @Query() query: pagination) {
    return await this.tagsService.findAll(user, query);
  }

  @SwaggerDecorator('get tag by id', true, true, 'tagId')
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Get(':tagId')
  findOne(@Param('tagId') tagId: string) {
    return this.tagsService.findOne(tagId);
  }

  @SwaggerDecorator('update a single tag', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch()
  update(@Body() updateTagDto: UpdateTagDto, @GetUser() user: IUser) {
    return this.tagsService.update(updateTagDto, user);
  }

  @SwaggerDecorator('update a single tag', true, true, 'tagId')
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Delete(':tagId')
  remove(@Param('tagId') tagId: string, @GetUser() user: IUser) {
    return this.tagsService.remove(tagId, user);
  }
}
