import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/common/decorators/user.decorater';
import { IUser } from 'src/user/interfaces/user.interface';
import { BuisnessService } from './buisness.service';
import { CreateBuisnessDto } from './dto/create-buisness.dto';
import { UpdateBuisnessDto } from './dto/update-buisness.dto';
import { UpdateCompleteBussinessDto } from './dto/update-complete-bussiness.dto';
import { UpdateOnBoardingDto } from './dto/update-on-boarding-flag.dto';
import { pagination } from 'src/common/interface/pagination';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
import { AuthDecorator } from 'src/common/decorators/auth-decorater';
import { USER_ROLE } from 'src/auth/enums/enums';

@ApiTags('buisness')
@Controller('buisness')
export class BuisnessController {
  constructor(private readonly buisnessService: BuisnessService) {}

  @SwaggerDecorator('switch your buisness', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async create(
    @Body() createBuisnessDto: CreateBuisnessDto,
    @GetUser() user: IUser,
    @UploadedFiles() image: Express.Multer.File[],
  ) {
    return await this.buisnessService.create(createBuisnessDto, user, image);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll() {
    return this.buisnessService.findAll();
  }

  @SwaggerDecorator('get teams', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Get('team')
  getTeam(
    @GetUser() user: IUser,
    // @Query('search') search: string,
    @Query('flag') flag: string,
    @Query() query: pagination,
  ) {
    const search = undefined;
    return this.buisnessService.getTeam(user, query, flag, search);
  }

  @Get(':buisnessId')
  findOne(@Param('buisnessId') buisnessId: string) {
    return this.buisnessService.getBuisnessById(buisnessId);
  }

  @Patch()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async update(
    @Body() updateBuisnessDto: UpdateBuisnessDto,
    @UploadedFiles() image: Express.Multer.File[],
  ) {
    return await this.buisnessService.update(updateBuisnessDto);
  }

  @Patch('update-on-boarding-flag')
  @UseGuards(AuthGuard())
  async updateIsOnBoardingFlag(
    @Body() updateOnBoardingDto: UpdateOnBoardingDto,
  ) {
    return await this.buisnessService.updateIsOnBoardingFlag(
      updateOnBoardingDto,
    );
  }

  @Patch('update-complete-bussiness')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async updateCompleteBussiness(
    @Body() updateCompleteBussinessDto: UpdateCompleteBussinessDto,
    @UploadedFiles() image: Express.Multer.File[],
  ) {
    return await this.buisnessService.updateCompleteBussiness(
      updateCompleteBussinessDto,
      image,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string, @GetUser() user: IUser) {
    return this.buisnessService.remove(id, user);
  }
}
