import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser, Role } from 'src/common/decorators/user.decorater';
import { RoleGuard } from 'src/common/guards/role.guard';
import { pagination } from 'src/common/interface/pagination';
import { IUser } from 'src/user/interfaces/user.interface';
import { CreatePackageDto } from './dto/create-package.dto';
import { PackagesService } from './package.service';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
import { AuthDecorator } from 'src/common/decorators/auth-decorater';
import { USER_ROLE } from 'src/auth/enums/enums';

@ApiTags('package')
@Controller('package')
export class PackageController {
  constructor(private readonly PackagesService: PackagesService) {}

  // Get request

  @SwaggerDecorator('get all packages')
  @Get('all-package')
  async getPackages(@Query('type') type: string, @Query() query: pagination) {
    return await this.PackagesService.getPackages(query, type);
  }

  @SwaggerDecorator('get single packages')
  @Get('single-package')
  async getSinglePackage(@Query() search: object) {
    return await this.PackagesService.getSinglePackage(search);
  }

  @SwaggerDecorator('subscribe a package', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Get('subscribe')
  async subscribe(
    @Query('planId') planId: string,
    @Query('lang') lang: string,
    @GetUser() user: IUser,
    @Req() request: Request,
  ) {
    const countryCode = request.headers['cloudfront-viewer-country'];
    return await this.PackagesService.subscribe(
      planId,
      user,
      countryCode,
      lang,
    );
  }

  @SwaggerDecorator('stripe billing portal', true)
  @AuthDecorator(USER_ROLE.SUPER_ADMIN)
  @Patch('manage-plan')
  @Role('super-admin')
  async managePlan(@GetUser() user: IUser) {
    return await this.PackagesService.managePlan(user);
  }

  // =================== POST ROUTES ======================

  // =================== PLATFORM ADMIN ROUTES ======================

  @ApiExcludeEndpoint()
  @Post('create-packages')
  @UseGuards(AuthGuard(), RoleGuard)
  @Role('guestly-admin')
  async createStripePackages(@Body() createPackageDto: CreatePackageDto) {
    return await this.PackagesService.createPackage(createPackageDto);
  }

  @ApiExcludeEndpoint()
  @Post('webhook')
  async subscriptionWeebhook(@Req() request: RawBodyRequest<Request>) {
    console.log('this api was hit');

    return await this.PackagesService.subscriptionWeebhook({ req: request });
  }

  // =================== PATCH ROUTES ======================

  // =================== PLATFORM ADMIN ROUTES ======================

  // @Post()
  // create(@Body() createPackageDto: CreatePackageDto) {
  //   return this.packageService.create(createPackageDto);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.packageService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
  //   return this.packageService.update(+id, updatePackageDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.packageService.remove(+id);
  // }
}
